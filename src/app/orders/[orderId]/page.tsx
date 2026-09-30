import { OrderDetails } from '@/components/commerce/AccountOrders';
export const metadata = {
  title: 'Your order',
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <OrderDetails id={orderId} />;
}
