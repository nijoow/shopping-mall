import { loadEnvConfig } from '@next/env';
import { PostgresStore } from '../src/server/database';
import { normalizedSetting } from '../src/server/database-config';
loadEnvConfig(process.cwd());
async function main() {
  const url =
    normalizedSetting(process.env.NIJOOW_POSTGRES_URL) ??
    normalizedSetting(process.env.POSTGRES_URL);
  if (!url) throw new Error('NIJOOW_POSTGRES_URL or POSTGRES_URL is required.');
  const store = new PostgresStore(url);
  try {
    await store.setup();
    console.log('nijoow_demo schema ready; existing public tables unchanged.');
  } finally {
    await store.close();
  }
}
void main().catch(error => {
  console.error(
    'Demo database setup failed:',
    (error as { code?: string }).code ?? 'UNAVAILABLE',
  );
  process.exitCode = 1;
});
