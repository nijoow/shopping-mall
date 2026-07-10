import { Metadata } from 'next';
import CartProducts from './_components/CartProducts';

export const metadata: Metadata = { title: 'Cart' };

export default function CartPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="display text-1.75 leading-none">
          CART<span className="text-volt">.</span>
        </h1>
        <p className="text-0.875 text-muted-foreground">
          ₩50,000 이상 구매 시 무료배송
        </p>
      </header>
      <CartProducts />
    </div>
  );
}
