/**
 * social_logins PK 를 user_id 단독 → (user_id, type) 복합키로 변경.
 * 한 유저가 여러 provider 소셜 로그인을 연결할 수 있게 한다.
 * 기존 행은 user_id 가 모두 달라 복합키 충돌 없음. (안전 가드 포함)
 *
 *   yarn dlx tsx scripts/migrate-social-logins-pk.ts
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

async function main() {
  // 복합키 충돌 여부 사전 확인
  const dup = await sql`
    SELECT user_id, type, COUNT(*) c FROM social_logins
    GROUP BY user_id, type HAVING COUNT(*) > 1`;
  if (dup.rows.length > 0) {
    throw new Error(
      `duplicate (user_id,type) rows exist — aborting: ${JSON.stringify(dup.rows)}`,
    );
  }

  await sql`ALTER TABLE social_logins DROP CONSTRAINT social_logins_pkey`;
  await sql`ALTER TABLE social_logins ADD PRIMARY KEY (user_id, type)`;
  console.log('social_logins PK → (user_id, type)');

  const cons = await sql`
    SELECT kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name='social_logins' AND tc.constraint_type='PRIMARY KEY'
    ORDER BY kcu.ordinal_position`;
  console.log('new PK columns:', cons.rows.map(r => r.column_name).join(', '));
}

main();
