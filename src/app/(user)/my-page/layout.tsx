import { auth } from 'auth';
import Link from 'next/link';
import React from 'react';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  return (
    <div className="py-24 px-8 max-w-5xl mx-auto flex h-full w-full">
      <div className="gap-8 w-64 h-full flex flex-col">
        <span className="text-2.25 font-semibold">
          {session?.user.nickname}
        </span>
        <span>좋아요 0</span>
        <div className="flex flex-col gap-4">
          <span className="text-1.25 font-semibold">쇼핑 정보</span>
          <span className="text-gray-500 font-light">주문배송조회</span>
          <span className="text-gray-500 font-light">취소/교환/반품 내역</span>
          <span className="text-gray-500 font-light">상품 리뷰</span>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-1.25 font-semibold">계정 설정</span>
          <Link
            href={'/my-page/information'}
            className="text-gray-500 font-light"
          >
            회원정보
          </Link>
          <Link
            href={'/my-page/addresses'}
            className="text-gray-500 font-light"
          >
            배송지 목록
          </Link>
          <span className="text-gray-500 font-light">포인트</span>
        </div>
      </div>
      <div className="w-full h-full flex flex-col">{children}</div>
    </div>
  );
};

export default Layout;
