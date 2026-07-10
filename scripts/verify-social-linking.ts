/**
 * linkOrCreateSocialUser 검증 (자기정리).
 * 같은 이메일에 대해 users 행이 중복 생성되지 않고 social_logins 만 연결되는지,
 * 재호출 시 중복 social_logins 가 안 생기는지 확인한다. 종료 시 전부 삭제.
 *
 *   yarn dlx tsx scripts/verify-social-linking.ts
 */
import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
      const match = line.match(/^([A-Z_]+)\s*=\s*(.*)$/);
      if (!match) return;
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] ??= value;
    });
}

const EXISTING = 'social-existing@example.com';
const FRESH = 'social-fresh@example.com';

const assert = (cond: boolean, msg: string) => {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
  console.log(`  ✓ ${msg}`);
};

const countUsers = async (email: string) =>
  Number(
    (await sql`SELECT COUNT(*)::int AS c FROM users WHERE email = ${email}`)
      .rows[0].c,
  );
const countSocials = async (email: string, provider: string) =>
  Number(
    (
      await sql`
    SELECT COUNT(*)::int AS c FROM social_logins s
    JOIN users u ON u.user_id = s.user_id
    WHERE u.email = ${email} AND s.type = ${provider}`
    ).rows[0].c,
  );

async function cleanup() {
  for (const email of [EXISTING, FRESH]) {
    // eslint-disable-next-line no-await-in-loop
    const ids = await sql`SELECT user_id FROM users WHERE email = ${email}`;
    for (let i = 0; i < ids.rows.length; i += 1) {
      const uid = ids.rows[i].user_id;
      // eslint-disable-next-line no-await-in-loop
      await sql`DELETE FROM social_logins WHERE user_id = ${uid}`;
      // eslint-disable-next-line no-await-in-loop
      await sql`DELETE FROM credentials WHERE user_id = ${uid}`;
      // eslint-disable-next-line no-await-in-loop
      await sql`DELETE FROM users WHERE user_id = ${uid}`;
    }
  }
}

async function main() {
  const { linkOrCreateSocialUser } = await import('../src/lib/database/user');

  await cleanup(); // 이전 실행 잔여 제거

  try {
    // 기존 credentials 계정 생성
    const created = await sql`
      INSERT INTO users (email, login_provider, nickname, name)
      VALUES (${EXISTING}, 'CREDENTIALS', 'kept', '기존유저') RETURNING user_id`;
    const existingUserId = created.rows[0].user_id;
    console.log(`\n[setup] credentials user #${existingUserId} (${EXISTING})`);

    console.log('\n[link social to existing email]');
    await linkOrCreateSocialUser({
      email: EXISTING,
      name: '기존유저',
      accountId: 'google-abc',
      provider: 'google',
    });
    assert((await countUsers(EXISTING)) === 1, 'no duplicate users row created');
    assert(
      (await countSocials(EXISTING, 'google')) === 1,
      'google social_login linked to existing user',
    );

    console.log('\n[idempotent re-link]');
    await linkOrCreateSocialUser({
      email: EXISTING,
      name: '기존유저',
      accountId: 'google-abc',
      provider: 'google',
    });
    assert(
      (await countSocials(EXISTING, 'google')) === 1,
      're-link did not duplicate social_login',
    );

    console.log('\n[second provider, same email]');
    await linkOrCreateSocialUser({
      email: EXISTING,
      name: '기존유저',
      accountId: 'kakao-xyz',
      provider: 'kakao',
    });
    assert(
      (await countUsers(EXISTING)) === 1,
      'still single users row across two providers',
    );
    assert((await countSocials(EXISTING, 'kakao')) === 1, 'kakao linked too');

    console.log('\n[fresh email creates account]');
    await linkOrCreateSocialUser({
      email: FRESH,
      name: '신규유저',
      accountId: 'naver-1',
      provider: 'naver',
    });
    assert((await countUsers(FRESH)) === 1, 'new user created for fresh email');
    assert((await countSocials(FRESH, 'naver')) === 1, 'naver social linked');
  } finally {
    console.log('\n[cleanup]');
    await cleanup();
    console.log('  removed test users');
  }

  console.log('\n✅ ALL ASSERTIONS PASSED');
}

main().catch(err => {
  console.error('\n❌', err.message);
  process.exit(1);
});
