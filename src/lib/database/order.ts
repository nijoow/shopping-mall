import { Order, OrderItem, OrderWithItems, Product } from '@/types/types';
import { Address } from '@/types/types';
import { createClient, sql } from '@vercel/postgres';

const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 3000;
const POINT_ACCRUAL_RATE = 0.01;

export interface OrderLineInput {
  productId: number;
  quantity: number;
  size: string | null;
  color: string | null;
}

/**
 * 주문 생성 — orders/order_items/재고/포인트를 하나의 트랜잭션으로 처리한다.
 * 가격·상품명은 클라이언트 값을 신뢰하지 않고 DB에서 다시 읽어 스냅샷한다.
 * 배송지도 주문 시점 값으로 박제한다.
 */
export const createOrder = async ({
  userId,
  addressId,
  lines,
}: {
  userId: number;
  addressId: number;
  lines: OrderLineInput[];
}): Promise<number> => {
  if (lines.length === 0) throw new Error('EMPTY_ORDER');

  const client = createClient();
  await client.connect();

  try {
    await client.sql`BEGIN`;

    // 배송지 스냅샷 — 본인 소유만
    const addressResult = await client.sql<Address>`
      SELECT * FROM address WHERE address_id = ${addressId} AND user_id = ${userId}
    `;
    const address = addressResult.rows[0];
    if (!address) throw new Error('ADDRESS_NOT_FOUND');

    // 주문에 포함된 상품을 한 번에 로드
    const productIds = lines.map(line => line.productId);
    const productsResult = await client.query<Product>(
      `SELECT * FROM products WHERE "productId" = ANY($1::int[])`,
      [productIds],
    );
    const productMap = new Map(
      productsResult.rows.map(product => [product.productId, product]),
    );

    let subtotal = 0;
    const snapshots = lines.map(line => {
      const product = productMap.get(line.productId);
      if (!product) throw new Error(`PRODUCT_NOT_FOUND:${line.productId}`);
      if (line.quantity < 1) throw new Error('INVALID_QUANTITY');
      if (product.stock < line.quantity) {
        throw new Error(`OUT_OF_STOCK:${product.productName}`);
      }
      subtotal += product.price * line.quantity;
      return {
        line,
        productName: product.productName,
        price: product.price,
      };
    });

    const shippingFee =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const totalAmount = subtotal + shippingFee;

    // 주문 헤더
    const orderResult = await client.sql<{ order_id: number }>`
      INSERT INTO orders
        (user_id, status, total_amount, recipient_name, phone_number, post_code, address, detail_address)
      VALUES
        (${userId}, 'PAID', ${totalAmount}, ${address.name}, ${address.phone_number},
         ${address.post_code}, ${address.address}, ${address.detail_address})
      RETURNING order_id
    `;
    const orderId = orderResult.rows[0].order_id;

    // 주문 항목 + 재고 차감
    for (const { line, productName, price } of snapshots) {
      // eslint-disable-next-line no-await-in-loop
      await client.sql`
        INSERT INTO order_items
          (order_id, product_id, product_name, price, quantity, size, color)
        VALUES
          (${orderId}, ${line.productId}, ${productName}, ${price}, ${line.quantity},
           ${line.size}, ${line.color})
      `;
      // eslint-disable-next-line no-await-in-loop
      await client.sql`
        UPDATE products
        SET stock = stock - ${line.quantity}, sell = sell + ${line.quantity}
        WHERE "productId" = ${line.productId}
      `;
    }

    // 포인트 적립 (상품 소계 기준 1%)
    const earnedPoints = Math.floor(subtotal * POINT_ACCRUAL_RATE);
    if (earnedPoints > 0) {
      await client.sql`
        UPDATE users SET point = point + ${earnedPoints} WHERE user_id = ${userId}
      `;
    }

    await client.sql`COMMIT`;
    return orderId;
  } catch (error) {
    await client.sql`ROLLBACK`;
    throw error;
  } finally {
    await client.end();
  }
};

export const getOrdersByUserId = async (
  userId: number,
): Promise<OrderWithItems[]> => {
  const ordersResult = await sql<Order>`
    SELECT * FROM orders WHERE user_id = ${userId} ORDER BY order_id DESC
  `;
  const orders = ordersResult.rows;
  if (orders.length === 0) return [];

  const orderIds = orders.map(order => order.order_id);
  const itemsResult = await sql.query<OrderItem>(
    `SELECT * FROM order_items WHERE order_id = ANY($1::int[]) ORDER BY order_item_id`,
    [orderIds],
  );

  const itemsByOrder = new Map<number, OrderItem[]>();
  itemsResult.rows.forEach(item => {
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push(item);
    itemsByOrder.set(item.order_id, list);
  });

  return orders.map(order => ({
    ...order,
    items: itemsByOrder.get(order.order_id) ?? [],
  }));
};

export const getOrderById = async (
  orderId: number,
  userId: number,
): Promise<OrderWithItems | null> => {
  const orderResult = await sql<Order>`
    SELECT * FROM orders WHERE order_id = ${orderId} AND user_id = ${userId}
  `;
  const order = orderResult.rows[0];
  if (!order) return null;

  const itemsResult = await sql<OrderItem>`
    SELECT * FROM order_items WHERE order_id = ${orderId} ORDER BY order_item_id
  `;

  return { ...order, items: itemsResult.rows };
};
