import { auth } from 'auth';
import Link from 'next/link';
import React from 'react';
import LogoutButton from './LogoutButton';
import Image from 'next/image';

const Header = async () => {
  const session = await auth();

  return (
    <div className="flex items-center flex-none gap-4 px-6 h-14">
      <Link href="/" className="relative w-[96px] h-[54px]">
        <Image src="/images/logo/nijoow.svg" alt={'nijoow logo'} fill />
      </Link>
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
