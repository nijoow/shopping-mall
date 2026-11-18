import { Suspense } from 'react';
import { Checkout } from '@/components/commerce/CartCheckout';
export const metadata = { title: 'Checkout' };
export default function Page() {
  return (
    <Suspense>
      <Checkout />
    </Suspense>
  );
}
