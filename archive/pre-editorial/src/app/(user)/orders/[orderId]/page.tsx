import { Button } from '@/components/ui/button';
import { getOrderById } from '@/lib/database/order';
import { commaToCurrency } from '@/utils';
import { auth } from 'auth';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { IoCheckmarkCircle } from 'react-icons/io5';

export const metadata: Metadata = { title: 'Order' };

export default async function OrderCompletePage({
  params: { orderId },
}: {
  params: { orderId: string };
}) {
  const session = await auth();
  if (!session?.user.user_id) redirect('/auth/login');

  const id = Number(orderId);
  if (Number.isNaN(id)) notFound();

  const order = await getOrderById(id, session.user.user_id);
  if (!order) notFound();

  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shippingFee = order.total_amount - itemsTotal;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-14 sm:px-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <IoCheckmarkCircle size={56} className="text-volt" />
        <h1 className="display text-1.75 leading-none">ORDER CONFIRMED</h1>
        <p className="text-0.875 text-muted-foreground">
          주문이 완료되었습니다. 주문번호 #{order.order_id}
        </p>
      </header>

      <section className="street-card flex flex-col gap-4 p-5">
        <h2 className="eyebrow">ITEMS</h2>
        <ul className="flex flex-col divide-y divide-border">
          {order.items.map(item => (
            <li
              key={item.order_item_id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-0.875 font-medium">
                  {item.product_name}
                </span>
                <span className="text-0.75 text-muted-foreground">
                  {item.size ? `SIZE ${item.size} · ` : ''}수량 {item.quantity}
                </span>
              </div>
              <span className="display text-0.875">
                ₩{commaToCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-1.5 border-t border-border pt-4 text-0.875">
          <div className="flex justify-between">
            <span className="text-muted-foreground">상품금액</span>
            <span>₩{commaToCurrency(itemsTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">배송비</span>
            <span>
              {shippingFee === 0 ? 'FREE' : `₩${commaToCurrency(shippingFee)}`}
            </span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="display tracking-widest">TOTAL</span>
            <span className="display text-1.25">
              ₩{commaToCurrency(order.total_amount)}
            </span>
          </div>
        </div>
      </section>

      <section className="street-card flex flex-col gap-2 p-5">
        <h2 className="eyebrow">SHIPPING TO</h2>
        <span className="font-bold">{order.recipient_name}</span>
        <span className="text-0.875 text-muted-foreground">
          {order.phone_number}
        </span>
        <span className="text-0.875 text-muted-foreground">
          [{order.post_code}] {order.address}
          {order.detail_address ? `, ${order.detail_address}` : ''}
        </span>
      </section>

      <div className="flex gap-2">
        <Button asChild variant="street-outline" size="lg" className="flex-1">
          <Link href="/my-page">주문 내역</Link>
        </Button>
        <Button asChild variant="volt" size="lg" className="flex-1">
          <Link href="/shop/all">계속 쇼핑</Link>
        </Button>
      </div>
    </div>
  );
}
