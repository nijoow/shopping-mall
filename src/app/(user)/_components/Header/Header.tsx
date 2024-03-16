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
    <div className="sticky top-0 z-50 flex h-14 flex-none items-center border-b border-b-gray-300 bg-white px-6">
      <Link href="/" className="relative mr-4 h-[54px] w-[96px]">
        <Image src="/images/logo/nijoow.svg" alt={'nijoow logo'} fill />
      </Link>
      <Link href="/shop" className="px-2">
        SHOP
      </Link>
      <Link href="/top" className="px-2">
        TOP
      </Link>
      <Link href="/features" className="px-2">
        FEATURES
      </Link>

      {/* <input
        className="w-full max-w-[240px] px-2"
        type="text"
        placeholder="검색어를 입력해주세요."
      /> */}
      <div className="flex-auto" />

      <div className="flex items-center">
        <span className="text-0.75">Language</span>
        <IoChevronForward size={16} />
      </div>
      <Link href="/like" className="group flex items-center gap-1 px-2">
        <IoHeartSharp size={20} />
        <span className="w-0 overflow-hidden text-0.75 transition-all group-hover:w-[48px]">
          MY&nbsp;LIKE
        </span>
      </Link>
      <Link href="/shopping-bag" className="group flex items-center gap-1 px-2">
        <IoBag size={20} />
        <span className="w-0 overflow-hidden text-0.75 transition-all group-hover:w-[90px]">
          SHOPPING&nbsp;BAG
        </span>
      </Link>

      {session ? (
        <>
          <Link href="/my-page" className="group flex items-center gap-1 px-2">
            <IoPerson size={20} />
            <span className="w-0 overflow-hidden text-0.75 transition-all group-hover:w-[60px]">
              MY&nbsp;PAGE
            </span>
          </Link>
          <LogoutButton />
        </>
      ) : (
        <Link href="/auth/login" className="group flex items-center gap-1 px-2">
          <IoLogIn size={20} />
          <span className="w-0 overflow-hidden text-0.75 transition-all group-hover:w-[60px]">
            LOGIN
          </span>
        </Link>
      )}
    </div>
  );
};

export default Header;
