import { spawn } from 'node:child_process';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

/** Start and dispose our own production server; never reuse a developer server. */
export default async function globalSetup() {
  await access(resolve('.next/BUILD_ID')).catch(() => {
    throw new Error(
      'Browser regression requires an existing production build. Run yarn build first.',
    );
  });
  const socket = createServer();
  await new Promise<void>((accept, reject) => {
    socket.once('error', reject);
    socket.listen(0, '127.0.0.1', accept);
  });
  const port = (socket.address() as { port: number }).port;
  await new Promise<void>((accept, reject) =>
    socket.close(error => (error ? reject(error) : accept())),
  );
  const directory = await mkdtemp(join(tmpdir(), 'nijoow-browser-'));
  const baseURL = `http://127.0.0.1:${port}`;
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1',
    NIJOOW_TEST_SQLITE_ONLY: '1',
    NIJOOW_DEMO_DB_PATH: join(directory, 'browser.sqlite'),
    NIJOOW_POSTGRES_URL: '',
    POSTGRES_URL: '',
    VERCEL: '',
    AUTH_SECRET: 'nijoow-isolated-browser-test-only-not-a-production-secret',
    AUTH_URL: baseURL,
    AUTH_TRUST_HOST: 'true',
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
    {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let startupError: Error | undefined;
  server.once('error', error => {
    startupError = error;
  });
  // Drain pipes without exposing environment or framework error payloads.
  server.stdout.resume();
  server.stderr.resume();
  const cleanup = async () => {
    if (server.pid && server.exitCode === null && server.signalCode === null) {
      const exited = new Promise<void>(accept =>
        server.once('exit', () => accept()),
      );
      server.kill('SIGTERM');
      await Promise.race([exited, delay(5000, undefined, { ref: false })]);
      if (
        server.pid &&
        server.exitCode === null &&
        server.signalCode === null
      ) {
        server.kill('SIGKILL');
        await exited;
      }
    }
    await rm(directory, { recursive: true, force: true });
  };
  try {
    const deadline = Date.now() + 45000;
    let ready = false;
    while (Date.now() < deadline) {
      if (startupError) throw startupError;
      if (server.exitCode !== null || server.signalCode !== null)
        throw new Error('Isolated browser server exited during startup.');
      try {
        const response = await fetch(`${baseURL}/api/demo`, {
          signal: AbortSignal.timeout(1500),
        });
        ready = response.ok;
      } catch {}
      if (ready) break;
      await delay(200);
    }
    if (!ready)
      throw new Error(
        'Isolated browser server did not become ready within 45 seconds.',
      );
    process.env.NIJOOW_BROWSER_BASE_URL = baseURL;
    return cleanup;
  } catch (error) {
    await cleanup();
    throw error;
  }
}
