import type { Config } from 'drizzle-kit';

/**
 * drizzle-kit 설정 — 스키마를 코드로 관리하기 위한 진입점.
 *   yarn dlx drizzle-kit introspect   # 실 DB → 스키마 역생성
 *   yarn dlx drizzle-kit generate     # 스키마 변경 → 마이그레이션 SQL 생성
 *
 * 주의: push/migrate 는 실 DB(프로덕션)에 반영되므로 신중히 사용할 것.
 * 현재 users/address 는 아직 zod 스키마로 관리되며 점진 이관 예정.
 */
export default {
  schema: './src/lib/database/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL ?? '',
  },
} satisfies Config;
