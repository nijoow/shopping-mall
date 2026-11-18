import { auth } from 'auth';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getMyAddresses } from '../my-page/addresses/action';
import CheckoutClient from './_components/CheckoutClient';

export const metadata: Metadata = { title: 'Checkout' };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user.user_id) redirect('/auth/login');

  const addresses = await getMyAddresses();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="display text-1.75 leading-none">
          CHECKOUT<span className="text-volt">.</span>
        </h1>
        <p className="text-0.875 text-muted-foreground">
          배송지를 확인하고 주문을 완료하세요.
        </p>
      </header>
      <CheckoutClient addresses={addresses} />
    </div>
  );
}
