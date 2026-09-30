'use client';

import { useCart } from '@/lib/savedProducts';
import Link from 'next/link';
import { IoBagOutline } from 'react-icons/io5';

const CartLink = () => {
  const { totalCount } = useCart();

  return (
    <Link
      href="/cart"
      aria-label="장바구니"
      className="relative flex h-10 w-10 items-center justify-center transition-colors hover:text-volt"
    >
      <IoBagOutline size={20} />
      {totalCount > 0 && (
        <span className="display absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center bg-volt px-1 text-0.625 leading-none text-ink">
          {totalCount}
        </span>
      )}
    </Link>
  );
};

export default CartLink;
