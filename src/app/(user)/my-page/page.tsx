import { auth } from 'auth';
import React from 'react';

export default async function MyPage() {
  const session = await auth();

  return (
    <div className="p-8 flex h-full w-full">
      <div className="gap-8 w-64 h-full flex flex-col">
        <span className="text-2.25 font-semibold">{session?.user?.name}</span>
        <span>좋아요 0</span>
        <div className="flex flex-col gap-4">
          <span className="text-1.25 font-semibold">나의 쇼핑정보</span>
          <span className="text-gray-500 font-light">주문배송조회</span>
          <span className="text-gray-500 font-light">취소/교환/반품 내역</span>
          <span className="text-gray-500 font-light">상품 리뷰</span>
        </div>
      </div>
      <div className="w-full h-full bg-gray-50"> </div>
    </div>
  );
}
