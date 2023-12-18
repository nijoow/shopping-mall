import { auth } from 'auth';
import Link from 'next/link';
import React from 'react';
import LogoutButton from './LogoutButton';

const Header = async () => {
  const session = await auth();

  return (
    <div className="h-14 px-6 items-center gap-4 flex">
      <Link href="/">LOGO</Link>
      <Link href="/shop">SHOP</Link>
      <Link href="/top">TOP</Link>
      <Link href="/features">FEATURES</Link>

      <input
        className="w-full max-w-[240px]"
        type="text"
        placeholder="검색어를 입력해주세요."
      />
      <div className="flex-auto" />
      <div>Language</div>
      <Link href="/like">LIKE</Link>
      <Link href="/shopping-bag">SHOPPINGBAG</Link>

      {session ? (
        <>
          <Link href="/my-page">MYPAGE</Link>
          <LogoutButton />
        </>
      ) : (
        <Link href="/auth/login">LOGIN</Link>
      )}
    </div>
  );
};

export default Header;
