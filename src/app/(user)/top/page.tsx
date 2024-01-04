import ProductCard from '@/components/ProductCard';
import React from 'react';

const TopPage = () => {
  return (
    <div className="p-8 flex h-full w-full">
      <div className="gap-8 w-64 h-full flex flex-col">
        <span className="text-1.5 font-semibold">TOP</span>
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
      <div className="w-full h-full grid grid-cols-12 bg-gray-50 border-l border-t">
        {[1, 2, 3, 4, 5, 6].map(ranking => (
          <ProductCard key={ranking} ranking={ranking} />
        ))}
      </div>
    </div>
  );
};

export default TopPage;
