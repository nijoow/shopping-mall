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
      <div className="grid h-fit w-full grid-cols-12 border-l border-t bg-gray-50"></div>
    </div>
  );
}
