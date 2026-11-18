import { Button } from '@/components/ui/button';
import { OrderWithItems } from '@/types/types';
import { commaToCurrency } from '@/utils';
import Link from 'next/link';

const STATUS_LABELS: Record<string, string> = {
  PAID: '결제완료',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  CANCELLED: '취소',
};

/** 서버에서 온 timestamp(문자열/Date)를 YYYY.MM.DD 로 */
const formatDate = (value: Date) => {
  const date = new Date(value);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`;
};

const OrderCard = ({ order }: { order: OrderWithItems }) => {
  const summary =
    order.items.length > 1
      ? `${order.items[0]?.product_name} 외 ${order.items.length - 1}건`
      : order.items[0]?.product_name;

  return (
    <Link
      href={`/orders/${order.order_id}`}
      className="street-card street-card-hover flex flex-col gap-3 p-4"
    >
      <div className="flex items-center justify-between">
        <span className="eyebrow">
          {formatDate(order.created_date)} · #{order.order_id}
        </span>
        <span className="display bg-secondary px-2 py-0.5 text-0.625 tracking-widest">
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-0.875">{summary}</span>
        <span className="display shrink-0 text-1">
          ₩{commaToCurrency(order.total_amount)}
        </span>
      </div>
    </Link>
  );
};

const OrderList = ({ orders }: { orders: OrderWithItems[] }) => {
  if (orders.length === 0) {
    return (
      <div className="street-card flex flex-col items-center gap-3 px-6 py-12 text-center">
        <span className="display text-1.125 text-muted-foreground">
          NO ORDERS YET
        </span>
        <p className="text-0.875 text-muted-foreground">
          아직 주문 내역이 없어요. 첫 드롭을 잡아보세요.
        </p>
        <Button asChild variant="volt" className="mt-1">
          <Link href="/shop/all">SHOP NOW</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {orders.map(order => (
        <OrderCard key={order.order_id} order={order} />
      ))}
    </div>
  );
};

export default OrderList;
