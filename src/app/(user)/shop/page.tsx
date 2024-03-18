import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import React from 'react';

export default function ShopPage() {
  return (
    <div className="flex h-full w-full flex-col py-4 sm:flex-row sm:p-8">
      <div className="flex h-full w-full flex-col gap-2 sm:w-64 sm:gap-8">
        <span className="pl-4 text-1.5 font-semibold sm:pl-0">SHOP</span>
        <div className="flex w-full flex-row gap-2 overflow-x-auto sm:flex-col">
          {['ALL', 'NEW', 'OUTER', 'TOP', 'BOTTOM', 'SHOES', 'ACC'].map(
            category => (
              <Link
                href="#"
                key={category}
                className="px-2 py-1.5 font-light text-gray-500"
              >
                {category}
              </Link>
            ),
          )}
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold">필터</span>
          <span className="font-light text-gray-500">COLOR</span>
          <span className="font-light text-gray-500">PRICE</span>
        </div>
      </div>
      <div className="grid h-fit w-full grid-cols-12 border-l border-t bg-gray-50">
        {[
          { productId: 1 },
          { productId: 2 },
          { productId: 3 },
          { productId: 4 },
          { productId: 5 },
          { productId: 6 },
        ].map(({ productId }) => (
          <ProductCard key={productId} productId={productId} />
        ))}
      </div>
    </div>
  );
}
