/**
 * Phase 2 커머스 도메인 스키마 마이그레이션 (사용자 승인 완료).
 *   - products.sizes text[] 추가 (기존 데이터 무영향)
 *   - orders / order_items 신규 테이블
 *   - 기존 상품에 카테고리별 샘플 사이즈 시드
 *
 *   yarn dlx tsx scripts/migrate-orders-schema.ts
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
  // 1) products.sizes — 멱등 (IF NOT EXISTS)
  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS sizes text[] NOT NULL DEFAULT '{}'::text[]
  `;
  console.log('products.sizes added');

  // 2) orders
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      order_id       serial PRIMARY KEY,
      user_id        integer NOT NULL REFERENCES users(user_id),
      status         varchar NOT NULL DEFAULT 'PAID',
      total_amount   integer NOT NULL,
      recipient_name varchar NOT NULL,
      phone_number   varchar NOT NULL,
      post_code      varchar NOT NULL,
      address        varchar NOT NULL,
      detail_address varchar,
      created_date   timestamp NOT NULL DEFAULT NOW()
    )
  `;
  console.log('orders table ready');

  // 3) order_items
  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      order_item_id serial PRIMARY KEY,
      order_id      integer NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
      product_id    integer NOT NULL REFERENCES products("productId"),
      product_name  varchar NOT NULL,
      price         integer NOT NULL,
      quantity      integer NOT NULL,
      size          varchar,
      color         varchar
    )
  `;
  console.log('order_items table ready');

  // 4) 카테고리별 샘플 사이즈 시드 (아직 비어있는 상품만)
  const apparel = await sql`
    UPDATE products SET sizes = ARRAY['S','M','L','XL']
    WHERE category IN ('OUTER','TOP','BOTTOM') AND cardinality(sizes) = 0
  `;
  const shoes = await sql`
    UPDATE products SET sizes = ARRAY['250','260','270','280','290']
    WHERE category = 'SHOES' AND cardinality(sizes) = 0
  `;
  const acc = await sql`
    UPDATE products SET sizes = ARRAY['FREE']
    WHERE category = 'ACCESSORY' AND cardinality(sizes) = 0
  `;
  console.log(
    `sizes seeded — apparel:${apparel.rowCount} shoes:${shoes.rowCount} acc:${acc.rowCount}`,
  );
}

main();
