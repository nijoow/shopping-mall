/**
 * createOrder 트랜잭션 검증 (자기정리).
 * 임시 배송지 생성 → 주문 생성 → 재고/포인트/주문항목 검증 → 전부 원복.
 * 프로덕션 데이터를 건드리지만 종료 시 원래 상태로 되돌린다.
 *
 *   yarn dlx tsx scripts/verify-order-flow.ts
 */
import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';
import { createOrder } from '../src/lib/database/order';

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

const TEST_EMAIL = 'test@test.com';

const assert = (cond: boolean, msg: string) => {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
  console.log(`  ✓ ${msg}`);
};

async function main() {
  const userRes =
    await sql`SELECT user_id, point FROM users WHERE email = ${TEST_EMAIL}`;
  const user = userRes.rows[0];
  if (!user) throw new Error(`test user ${TEST_EMAIL} not found`);
  const userId = user.user_id as number;
  const pointBefore = Number(user.point);

  const prodRes = await sql`
    SELECT "productId", "productName", price, stock, sell
    FROM products WHERE stock >= 2 ORDER BY "productId" LIMIT 1`;
  const product = prodRes.rows[0];
  if (!product) throw new Error('no product with stock >= 2');
  const productId = product.productId as number;
  const stockBefore = Number(product.stock);
  const sellBefore = Number(product.sell);
  const price = Number(product.price);

  // 임시 배송지
  const addrRes = await sql`
    INSERT INTO address (user_id, name, phone_number, post_code, address, detail_address)
    VALUES (${userId}, '테스트수령인', '010-0000-0000', '00000', '검증용 주소', '101호')
    RETURNING address_id`;
  const addressId = addrRes.rows[0].address_id as number;

  let orderId: number | null = null;
  try {
    const qty = 2;
    const expectedSubtotal = price * qty;
    const expectedShipping = expectedSubtotal >= 50000 ? 0 : 3000;
    const expectedTotal = expectedSubtotal + expectedShipping;
    const expectedPoints = Math.floor(expectedSubtotal * 0.01);

    console.log('\n[createOrder]');
    orderId = await createOrder({
      userId,
      addressId,
      lines: [{ productId, quantity: qty, size: 'M', color: null }],
    });
    assert(typeof orderId === 'number' && orderId > 0, `order created (#${orderId})`);

    const orderRes = await sql`SELECT * FROM orders WHERE order_id = ${orderId}`;
    const order = orderRes.rows[0];
    assert(order != null, 'order row exists');
    assert(
      Number(order.total_amount) === expectedTotal,
      `total_amount = ${expectedTotal} (got ${order.total_amount})`,
    );
    assert(order.recipient_name === '테스트수령인', 'address snapshot: name');
    assert(order.post_code === '00000', 'address snapshot: post_code');

    const itemRes =
      await sql`SELECT * FROM order_items WHERE order_id = ${orderId}`;
    assert(itemRes.rows.length === 1, 'one order_item');
    const item = itemRes.rows[0];
    assert(Number(item.price) === price, `item price snapshot = ${price}`);
    assert(Number(item.quantity) === qty, `item quantity = ${qty}`);
    assert(item.size === 'M', 'item size = M');

    const afterProd =
      await sql`SELECT stock, sell FROM products WHERE "productId" = ${productId}`;
    assert(
      Number(afterProd.rows[0].stock) === stockBefore - qty,
      `stock ${stockBefore} → ${stockBefore - qty}`,
    );
    assert(
      Number(afterProd.rows[0].sell) === sellBefore + qty,
      `sell ${sellBefore} → ${sellBefore + qty}`,
    );

    const afterUser =
      await sql`SELECT point FROM users WHERE user_id = ${userId}`;
    assert(
      Number(afterUser.rows[0].point) === pointBefore + expectedPoints,
      `points ${pointBefore} → ${pointBefore + expectedPoints} (+${expectedPoints})`,
    );

    console.log('\n[out-of-stock guard]');
    let threw = false;
    try {
      await createOrder({
        userId,
        addressId,
        lines: [{ productId, quantity: 999999, size: null, color: null }],
      });
    } catch (e) {
      threw = true;
      assert(
        (e as Error).message.startsWith('OUT_OF_STOCK'),
        'rejects over-stock order',
      );
    }
    assert(threw, 'over-stock order threw');

    const stockUnchanged =
      await sql`SELECT stock FROM products WHERE "productId" = ${productId}`;
    assert(
      Number(stockUnchanged.rows[0].stock) === stockBefore - qty,
      'failed order did not further decrement stock (rollback ok)',
    );
  } finally {
    console.log('\n[cleanup]');
    if (orderId) {
      await sql`DELETE FROM orders WHERE order_id = ${orderId}`; // cascades order_items
      console.log(`  restored: deleted order #${orderId}`);
    }
    await sql`UPDATE products SET stock = ${stockBefore}, sell = ${sellBefore} WHERE "productId" = ${productId}`;
    await sql`UPDATE users SET point = ${pointBefore} WHERE user_id = ${userId}`;
    await sql`DELETE FROM address WHERE address_id = ${addressId}`;
    console.log('  restored: stock, sell, points, temp address');
  }

  console.log('\n✅ ALL ASSERTIONS PASSED');
}

main().catch(err => {
  console.error('\n❌', err.message);
  process.exit(1);
});
