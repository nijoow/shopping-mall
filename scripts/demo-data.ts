import { parseArgs } from 'node:util';
import { DatabaseSync } from 'node:sqlite';
import { readFile, writeFile, access, mkdtemp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import {
  PostgresStore,
  postgresConnectionString,
  SqliteStore,
  type Store,
  type Row,
} from '../src/server/database';
import { normalizedSetting } from '../src/server/database-config';
import { planRetention, applyRetention } from '../src/server/data-retention';
import { backupSqlite, restoreSqlite } from '../src/server/data-backup';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    sqlite: { type: 'string' },
    postgres: { type: 'boolean' },
    plan: { type: 'string' },
    file: { type: 'string' },
    batch: { type: 'string' },
    apply: { type: 'boolean' },
    confirm: { type: 'string' },
  },
});
const [command] = positionals;
if (
  positionals.length !== 1 ||
  !['cleanup', 'backup', 'restore'].includes(command)
)
  throw new Error('Expected cleanup, backup or restore.');
if (Boolean(values.sqlite) === Boolean(values.postgres))
  throw new Error('Select exactly one explicit --sqlite path or --postgres.');
// Deliberately never load .env files or use application POSTGRES_URL credentials.
const postgres = values.postgres
  ? normalizedSetting(process.env.NIJOOW_OPERATIONS_POSTGRES_URL)
  : undefined;
if (values.postgres && !postgres)
  throw new Error(
    'NIJOOW_OPERATIONS_POSTGRES_URL must explicitly identify the operation database.',
  );
const connectionString = postgres
  ? postgresConnectionString(postgres)
  : undefined;
const identity = postgres
  ? (() => {
      const url = new URL(postgres);
      return `postgres:${url.hostname}:${url.port || '5432'}${url.pathname}`;
    })()
  : `sqlite:${resolve(values.sqlite!)}`;
const databaseHash = createHash('sha256').update(identity).digest('hex');

class ReadOnlySqlite implements Store {
  private db: DatabaseSync;
  constructor(path: string) {
    this.db = new DatabaseSync(path, { readOnly: true });
  }
  async rows(sql: string, params: (string | number | null)[]) {
    return this.db.prepare(sql).all(...params) as Row[];
  }
  async run(): Promise<{ changes: number }> {
    throw new Error('Dry-run cannot write.');
  }
  async transaction<T>(fn: () => Promise<T>) {
    return fn();
  }
  async close() {
    this.db.close();
  }
}
async function pgCommand(executable: string, args: string[]) {
  const url = new URL(connectionString!);
  const host = url.hostname.replace(/^\[|\]$/g, ''),
    port = url.port || '5432';
  const database = decodeURIComponent(url.pathname.slice(1)),
    user = decodeURIComponent(url.username),
    password = decodeURIComponent(url.password);
  if ([host, database, user, password].some(value => /[\r\n]/.test(value)))
    throw new Error('Connection fields cannot contain line breaks.');
  const directory = await mkdtemp(join(tmpdir(), 'nijoow-libpq-'));
  const passfile = join(directory, 'pgpass');
  const escape = (value: string) =>
    value.replace(/\\/g, '\\\\').replace(/:/g, '\\:');
  try {
    await writeFile(
      passfile,
      [host, port, database, user, password].map(escape).join(':') + '\n',
      { mode: 0o600 },
    );
    const env = { ...process.env };
    for (const key of Object.keys(env))
      if (
        key.startsWith('PG') ||
        key.startsWith('POSTGRES') ||
        key === 'NIJOOW_OPERATIONS_POSTGRES_URL'
      )
        delete env[key];
    Object.assign(env, {
      PGHOST: host,
      PGPORT: port,
      PGDATABASE: database,
      PGUSER: user,
      PGPASSFILE: passfile,
      PGCONNECT_TIMEOUT: '10',
    });
    for (const [query, key] of Object.entries({
      sslmode: 'PGSSLMODE',
      sslrootcert: 'PGSSLROOTCERT',
      sslcert: 'PGSSLCERT',
      sslkey: 'PGSSLKEY',
      channel_binding: 'PGCHANNELBINDING',
      options: 'PGOPTIONS',
    })) {
      const value = url.searchParams.get(query);
      if (value) env[key] = value;
    }
    await new Promise<void>((accept, reject) => {
      const child = spawn(executable, args, {
        env,
        stdio: ['ignore', 'ignore', 'pipe'],
      });
      child.stderr.resume();
      child.once('error', () =>
        reject(new Error(`${executable} is unavailable.`)),
      );
      child.once('exit', code =>
        code === 0
          ? accept()
          : reject(
              new Error(
                `${executable} failed (exit ${code}). Check the target and tool version.`,
              ),
            ),
      );
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function main() {
  if (command === 'cleanup') {
    if (!values.plan) throw new Error('An explicit --plan file is required.');
    if (values.apply && values.confirm !== 'APPLY_RETENTION')
      throw new Error(
        '--apply requires --confirm APPLY_RETENTION. Review the dry-run file first.',
      );
    if (values.sqlite) await access(values.sqlite);
    const store = postgres
      ? new PostgresStore(postgres)
      : values.apply
        ? new SqliteStore(values.sqlite!)
        : new ReadOnlySqlite(values.sqlite!);
    try {
      if (values.apply) {
        const manifest = JSON.parse(await readFile(values.plan, 'utf8'));
        if (manifest.databaseHash !== databaseHash)
          throw new Error('Dry-run database does not match selected target.');
        console.log(JSON.stringify(await applyRetention(store, manifest.plan)));
      } else {
        const plan = await planRetention(store, Number(values.batch ?? 50));
        await writeFile(
          values.plan,
          JSON.stringify({ databaseHash, plan }, null, 2),
          { mode: 0o600, flag: 'wx' },
        );
        console.log(
          JSON.stringify({
            mode: 'dry-run',
            guests: plan.guests.length,
            shares: plan.shares.length,
            planFile: resolve(values.plan),
          }),
        );
      }
    } finally {
      await store.close();
    }
    return;
  }
  if (!values.file)
    throw new Error('An explicit --file backup path is required.');
  if (command === 'backup') {
    if (postgres) {
      await writeFile(values.file, '', { mode: 0o600, flag: 'wx' });
      await pgCommand('pg_dump', [
        '--format=custom',
        '--schema=nijoow_demo',
        '--no-owner',
        '--no-acl',
        `--file=${resolve(values.file)}`,
      ]);
      await pgCommand('pg_restore', ['--list', resolve(values.file)]);
      await writeFile(
        `${values.file}.json`,
        JSON.stringify({ databaseHash, createdAt: new Date().toISOString() }),
        { mode: 0o600, flag: 'wx' },
      );
      console.log(
        'PostgreSQL archive created; verify by restoring into a separate empty database.',
      );
    } else
      console.log(
        JSON.stringify(await backupSqlite(values.sqlite!, values.file)),
      );
    return;
  }
  if (values.confirm !== 'RESTORE_NEW_DATABASE')
    throw new Error(
      'Restore requires --confirm RESTORE_NEW_DATABASE and an unused target.',
    );
  if (postgres) {
    const metadata = JSON.parse(await readFile(`${values.file}.json`, 'utf8'));
    if (metadata.databaseHash === databaseHash)
      throw new Error('Restore target must differ from backup source.');
    const store = new PostgresStore(postgres);
    try {
      const schemas = await store.pool.query(
        "SELECT 1 FROM pg_namespace WHERE nspname='nijoow_demo'",
      );
      if (schemas.rows.length)
        throw new Error(
          'Restore requires a database without nijoow_demo. Existing schemas are never dropped.',
        );
    } finally {
      await store.close();
    }
    // An empty dbname option lets libpq use the explicit PGDATABASE setting.
    await pgCommand('pg_restore', [
      '--dbname=',
      '--exit-on-error',
      '--single-transaction',
      '--no-owner',
      '--no-acl',
      resolve(values.file),
    ]);
    console.log(
      'Archive restored into a separate database. Run application smoke tests before switching configuration.',
    );
  } else
    console.log(
      JSON.stringify(await restoreSqlite(values.file, values.sqlite!)),
    );
}
void main().catch(error => {
  console.error(
    '[data-operation]',
    error instanceof Error ? error.message : 'Operation failed.',
  );
  process.exitCode = 1;
});
