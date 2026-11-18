import { auth } from 'auth';
import Link from 'next/link';
import React from 'react';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl px-8 py-24">
      <div className="hidden h-full w-64 flex-col gap-8 sm:flex">
        <div className="flex flex-col gap-4">
          <span className="text-1.25 font-semibold">쇼핑 정보</span>
          <span className="font-light text-gray-500">주문배송조회</span>
          <span className="font-light text-gray-500">취소/교환/반품 내역</span>
          <span className="font-light text-gray-500">상품 리뷰</span>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-1.25 font-semibold">계정 설정</span>
          <Link
            href="/my-page/information"
            className="font-light text-gray-500"
          >
            회원정보
          </Link>
          <Link href="/my-page/addresses" className="font-light text-gray-500">
            배송지 목록
          </Link>
          <span className="font-light text-gray-500">포인트</span>
        </div>
      </div>
      <div className="flex h-full w-full flex-col">{children}</div>
    </div>
  );
};

export default Layout;
