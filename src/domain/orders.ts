import { FREE_SHIPPING, SHIPPING_FEE } from './catalog';
import type { OrderItem, OrderStatus } from './types';

/** Shared quote calculation; the server still recalculates from owned cart rows. */
export function orderTotals(
  lines: readonly Pick<OrderItem, 'unitPrice' | 'quantity'>[],
) {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  const shipping = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
  return { subtotal, shipping, total: subtotal + shipping };
}

export const ORDER_PROGRESS: Partial<
  Record<OrderStatus, { next: OrderStatus; label: string }>
> = {
  CONFIRMED: { next: 'PREPARING', label: '출고 준비로 진행' },
  PREPARING: { next: 'SHIPPED', label: '배송 중으로 진행' },
  SHIPPED: { next: 'DELIVERED', label: '배송 완료로 진행' },
  RETURN_REQUESTED: { next: 'REFUNDED', label: '회수 완료 · 모의 환불' },
};

/** Repeating the current status is handled separately as an idempotent request. */
export function canAdvanceOrder(current: OrderStatus, target: OrderStatus) {
  return (
    ORDER_PROGRESS[current]?.next === target ||
    (target === 'CANCELLED' &&
      (current === 'CONFIRMED' || current === 'PREPARING')) ||
    (target === 'RETURN_REQUESTED' && current === 'DELIVERED')
  );
}
