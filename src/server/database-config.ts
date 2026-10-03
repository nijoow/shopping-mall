import { resolve } from 'node:path';

export const normalizedSetting = (value: string | undefined) =>
  value?.trim() || undefined;

type Environment = Record<string, string | undefined>;
export type DatabaseConfiguration =
  { kind: 'sqlite'; path: string } | { kind: 'postgres'; url: string };

/** Pure selection, so tests never construct a pool from ambient deployment secrets. */
export function databaseConfiguration(env: Environment): DatabaseConfiguration {
  if (normalizedSetting(env.NIJOOW_TEST_SQLITE_ONLY) === '1') {
    const path = normalizedSetting(env.NIJOOW_DEMO_DB_PATH);
    if (!path)
      throw new Error(
        'Isolated SQLite tests require an explicit database path.',
      );
    return { kind: 'sqlite', path: path === ':memory:' ? path : resolve(path) };
  }
  const cloud = !!normalizedSetting(env.VERCEL);
  const url =
    normalizedSetting(env.NIJOOW_POSTGRES_URL) ??
    (cloud ? normalizedSetting(env.POSTGRES_URL) : undefined);
  if (url) return { kind: 'postgres', url };
  if (cloud)
    throw new Error(
      'Persistent PostgreSQL must be configured before deployment.',
    );
  const path =
    normalizedSetting(env.NIJOOW_DEMO_DB_PATH) ?? '.data/editorial.sqlite';
  return { kind: 'sqlite', path: path === ':memory:' ? path : resolve(path) };
}
