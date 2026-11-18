import { DatabaseSync } from 'node:sqlite';
import { AsyncLocalStorage } from 'node:async_hooks';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Pool, type PoolClient } from 'pg';

type Parameter = string | number | null;
export type Row = Record<string, string | number | null>;
export interface Store {
  rows(sql: string, params: Parameter[]): Promise<Row[]>;
  run(sql: string, params: Parameter[]): Promise<{ changes: number }>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
// Explicit columns keep insertion order identical across both databases.
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, provider TEXT NOT NULL, provider_id TEXT NOT NULL, name TEXT NOT NULL, UNIQUE(provider,provider_id));
CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, account_id TEXT REFERENCES accounts(id), updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS cart (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(id), product_id TEXT NOT NULL, size TEXT NOT NULL, quantity INTEGER NOT NULL CHECK(quantity>0), config TEXT, config_key TEXT NOT NULL, preview TEXT);
CREATE TABLE IF NOT EXISTS favorites (workspace_id TEXT NOT NULL REFERENCES workspaces(id), product_id TEXT NOT NULL, PRIMARY KEY(workspace_id,product_id));
CREATE TABLE IF NOT EXISTS designs (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(id), name TEXT NOT NULL, config TEXT NOT NULL, version INTEGER NOT NULL, updated_at TEXT NOT NULL, preview TEXT);
CREATE TABLE IF NOT EXISTS inventory (workspace_id TEXT NOT NULL REFERENCES workspaces(id), product_id TEXT NOT NULL, size TEXT NOT NULL, stock INTEGER NOT NULL CHECK(stock>=0), PRIMARY KEY(workspace_id,product_id,size));
CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(id), request_key TEXT NOT NULL, payload TEXT NOT NULL, UNIQUE(workspace_id,request_key));
CREATE TABLE IF NOT EXISTS shares (token TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(id), payload TEXT NOT NULL, expires_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS workspace_account ON workspaces(account_id);
CREATE INDEX IF NOT EXISTS orders_workspace ON orders(workspace_id);
CREATE INDEX IF NOT EXISTS designs_workspace ON designs(workspace_id);`;

export class SqliteStore implements Store {
  readonly db: DatabaseSync;
  private pending: Promise<unknown> = Promise.resolve();
  private readonly active = new AsyncLocalStorage<boolean>();
  constructor(path: string) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(
      'PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;',
    );
    this.db.exec(SCHEMA);
    for (const table of ['cart', 'designs'])
      if (
        !(this.db.prepare(`PRAGMA table_info(${table})`).all() as Row[]).some(
          r => r.name === 'preview',
        )
      )
        this.db.exec(`ALTER TABLE ${table} ADD COLUMN preview TEXT`);
  }
  private queue<T>(fn: () => T | Promise<T>): Promise<T> {
    if (this.active.getStore()) return Promise.resolve(fn());
    const operation = this.pending.then(fn);
    this.pending = operation.catch(() => undefined);
    return operation;
  }
  rows(sql: string, params: Parameter[]) {
    return this.queue(() => this.db.prepare(sql).all(...params) as Row[]);
  }
  run(sql: string, params: Parameter[]) {
    return this.queue(() => ({
      changes: Number(this.db.prepare(sql).run(...params).changes),
    }));
  }
  transaction<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active.getStore()) return fn();
    return this.queue(() =>
      this.active.run(true, async () => {
        this.db.exec('BEGIN IMMEDIATE');
        try {
          const result = await fn();
          this.db.exec('COMMIT');
          return result;
        } catch (error) {
          this.db.exec('ROLLBACK');
          throw error;
        }
      }),
    );
  }
  async close() {
    await this.pending;
    this.db.close();
  }
}

export class PostgresStore implements Store {
  readonly pool: Pool;
  private readonly active = new AsyncLocalStorage<PoolClient>();
  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString: (() => {
        const url = new URL(connectionString);
        if (
          !['localhost', '127.0.0.1', '::1'].includes(url.hostname) &&
          !url.searchParams.has('sslmode')
        )
          url.searchParams.set('sslmode', 'verify-full');
        return url.toString();
      })(),
      max: 4,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 10000,
    });
    this.pool.on('error', () =>
      console.error('[demo-db] idle connection failed'),
    );
  }
  private qualify(text: string) {
    return text.replace(
      /\b(accounts|workspaces|cart|favorites|designs|inventory|orders|shares)\b/g,
      'nijoow_demo.$1',
    );
  }
  private sql(text: string) {
    let n = 0;
    const ignored = text.startsWith('INSERT OR IGNORE');
    text = text
      .replace('INSERT OR IGNORE', 'INSERT')
      .replace(/\?/g, () => `$${++n}`);
    // Application ordering uses UUIDs consistently; rowid is SQLite-only.
    text = text.replace(
      /json_extract\(payload,'\$\.createdAt'\)/g,
      "(payload::jsonb->>'createdAt')",
    );
    if (ignored) text += ' ON CONFLICT DO NOTHING';
    return this.qualify(text);
  }
  async rows(sql: string, params: Parameter[]) {
    return (
      await (this.active.getStore() ?? this.pool).query(this.sql(sql), params)
    ).rows as Row[];
  }
  async run(sql: string, params: Parameter[]) {
    return {
      changes:
        (
          await (this.active.getStore() ?? this.pool).query(
            this.sql(sql),
            params,
          )
        ).rowCount ?? 0,
    };
  }
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active.getStore()) return fn();
    for (let attempt = 0; ; attempt++) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
        const result = await this.active.run(client, fn);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        const code = (error as { code?: string }).code;
        if (attempt >= 3 || !['40001', '40P01'].includes(code ?? ''))
          throw error;
      } finally {
        client.release();
      }
      await new Promise(resolve =>
        setTimeout(resolve, 20 + Math.random() * 40),
      );
    }
  }
  async setup() {
    await this.pool.query('CREATE SCHEMA IF NOT EXISTS nijoow_demo');
    await this.pool.query(this.qualify(SCHEMA));
  }
  async close() {
    await this.pool.end();
  }
}
