import ProductCard from '@/components/ProductCard';
import React from 'react';

export default function TopPage() {
  return (
    <div className="flex h-full w-full p-8">
      <div className="flex h-full w-64 flex-col gap-8">
        <span className="text-1.5 font-semibold">TOP</span>
        <div className="flex flex-col gap-2">
          <span className="font-light text-gray-500">ALL</span>
          <span className="font-light text-gray-500">NEW</span>
          <span className="font-light text-gray-500">OUTER</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold">필터</span>
          <span className="font-light text-gray-500">COLOR</span>
          <span className="font-light text-gray-500">PRICE</span>
        </div>
      </div>
      <div className="grid h-fit w-full grid-cols-12 border-l border-t bg-gray-50">
        {[
          { productId: 1, ranking: 1 },
          { productId: 2, ranking: 2 },
          { productId: 3, ranking: 3 },
          { productId: 4, ranking: 4 },
          { productId: 5, ranking: 5 },
          { productId: 6, ranking: 6 },
        ].map(({ productId, ranking }) => (
          <ProductCard
            key={productId}
            productId={productId}
            ranking={ranking}
          />
        ))}
      </div>
    </div>
  );
}
