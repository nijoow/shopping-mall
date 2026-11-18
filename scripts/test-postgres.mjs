import { spawn } from 'node:child_process';
if (!process.env.NIJOOW_TEST_POSTGRES_URL?.trim()) {
  console.error(
    'NIJOOW_TEST_POSTGRES_URL에 별도 테스트 DB를 지정해줘. 운영 POSTGRES_URL은 자동 사용하지 않아.',
  );
  process.exitCode = 1;
} else {
  const test = spawn(
    process.execPath,
    ['--import', 'tsx', '--test', 'tests/postgres.test.ts'],
    { stdio: 'inherit', timeout: 120000 },
  );
  test.once('error', error => {
    console.error(error.message);
    process.exitCode = 1;
  });
  test.once('exit', code => {
    process.exitCode = code ?? 1;
  });
}
