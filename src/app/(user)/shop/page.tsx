import ProductCard from '@/components/ProductCard';
import React from 'react';

export default function ShopPage() {
  return (
    <div className="p-8 flex h-full w-full">
      <div className="gap-8 w-64 h-full flex flex-col">
        <span className="text-1.5 font-semibold">SHOP</span>
        <div className="flex flex-col gap-2">
          <span className="text-gray-500 font-light">ALL</span>
          <span className="text-gray-500 font-light">NEW</span>
          <span className="text-gray-500 font-light">OUTER</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold">필터</span>
          <span className="text-gray-500 font-light">COLOR</span>
          <span className="text-gray-500 font-light">PRICE</span>
        </div>
      </div>
      <div className="w-full h-fit grid grid-cols-12 bg-gray-50 border-l border-t">
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
      </div>
    </div>
  );
}
