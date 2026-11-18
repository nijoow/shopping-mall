import { spawn } from 'node:child_process';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

// Own one temporary database and one server. Never attach to a developer's server.
await access('.next/BUILD_ID').catch(() => {
  throw new Error('프로덕션 빌드가 없어. 먼저 yarn build를 실행해줘.');
});
const socket = createServer();
await new Promise((accept, reject) => {
  socket.once('error', reject);
  socket.listen(0, '127.0.0.1', accept);
});
const port = socket.address().port;
await new Promise((accept, reject) =>
  socket.close(error => (error ? reject(error) : accept())),
);
const directory = await mkdtemp(join(tmpdir(), 'nijoow-http-'));
const base = `http://127.0.0.1:${port}`;
const env = {
  ...process.env,
  NODE_ENV: 'production',
  NEXT_TELEMETRY_DISABLED: '1',
  NIJOOW_DEMO_DB_PATH: join(directory, 'test.sqlite'),
  // Empty values override .env.local without sending its DB/auth settings to the test app.
  NIJOOW_POSTGRES_URL: '',
  POSTGRES_URL: '',
  VERCEL: '',
  AUTH_SECRET: 'nijoow-isolated-http-test-only-not-a-production-secret',
  AUTH_URL: base,
  AUTH_TRUST_HOST: 'true',
  NIJOOW_TEST_BASE_URL: base,
};
for (const provider of ['GOOGLE', 'KAKAO', 'NAVER']) {
  env[`AUTH_${provider}_ID`] = '';
  env[`AUTH_${provider}_SECRET`] = '';
}
const server = spawn(
  process.execPath,
  [
    resolve('node_modules/next/dist/bin/next'),
    'start',
    '--hostname',
    '127.0.0.1',
    '--port',
    String(port),
  ],
  { env, stdio: ['ignore', 'pipe', 'pipe'] },
);
let logs = '',
  startupError;
server.stdout.on('data', chunk => {
  logs = (logs + chunk).slice(-16000);
});
server.stderr.on('data', chunk => {
  logs = (logs + chunk).slice(-16000);
});
server.on('error', error => {
  startupError = error;
});
let smoke;
const interrupted = () => {
  smoke?.kill('SIGTERM');
  server.kill('SIGTERM');
};
process.once('SIGINT', interrupted);
process.once('SIGTERM', interrupted);
try {
  let ready = false;
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    if (startupError) throw startupError;
    if (server.exitCode !== null || server.signalCode !== null)
      throw new Error('검증 서버가 시작 중 종료됐어.');
    try {
      const response = await fetch(`${base}/api/demo`, {
        signal: AbortSignal.timeout(1500),
      });
      if (response.ok && (await response.json()).state?.workspaceId) {
        ready = true;
        break;
      }
    } catch {
      /* Startup is bounded by the deadline. */
    }
    await delay(250);
  }
  if (!ready) throw new Error('검증 서버가 45초 안에 준비되지 않았어.');
  await new Promise((accept, reject) => {
    smoke = spawn(process.execPath, ['tests/http-smoke.mjs'], {
      env,
      stdio: 'inherit',
      timeout: 120000,
    });
    smoke.once('error', reject);
    smoke.once('exit', (code, signal) =>
      code === 0
        ? accept()
        : reject(new Error(`HTTP 검증 실패: ${signal ?? code}`)),
    );
  });
  console.log('HTTP 검증 통과 · 임시 서버/SQLite 정리');
} catch (error) {
  console.error(logs);
  throw error;
} finally {
  process.removeListener('SIGINT', interrupted);
  process.removeListener('SIGTERM', interrupted);
  if (server.pid && server.exitCode === null && server.signalCode === null) {
    const stopped = new Promise(accept => server.once('exit', accept));
    server.kill('SIGTERM');
    const force = setTimeout(() => server.kill('SIGKILL'), 5000);
    await stopped;
    clearTimeout(force);
  }
  await rm(directory, { recursive: true, force: true });
}
