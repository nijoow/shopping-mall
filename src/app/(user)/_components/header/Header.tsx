import { auth } from 'auth';
import Link from 'next/link';
import React from 'react';
import LogoutButton from './LogoutButton';
import Image from 'next/image';
import {
  IoHeartSharp,
  IoPerson,
  IoBag,
  IoChevronForward,
  IoLogIn,
} from 'react-icons/io5';

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

      <div className="flex items-center">
        <span className="text-0.75">Language</span>
        <IoChevronForward size={16} />
      </div>
      <Link href="/like" className="gap-1 flex items-center">
        <IoHeartSharp size={20} /> <span className="text-0.75">MY LIKE</span>
      </Link>
      <Link href="/shopping-bag" className="gap-1 flex items-center">
        <IoBag size={20} /> <span className="text-0.75">SHOPPING BAG</span>
      </Link>

      {session ? (
        <>
          <Link href="/my-page" className="gap-1 flex items-center">
            <IoPerson size={20} /> <span className="text-0.75">MY PAGE</span>
          </Link>
          <LogoutButton />
        </>
      ) : (
        <Link href="/auth/login" className="gap-1 flex items-center">
          <IoLogIn size={20} /> <span className="text-0.75">LOGIN</span>
        </Link>
      )}
    </div>
  );
};

export default Header;
