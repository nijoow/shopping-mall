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
    <div className="sticky z-50 top-0 flex items-center flex-none px-6 h-14 border-b border-b-gray-300 bg-white">
      <Link href="/" className="relative w-[96px] h-[54px] mr-4">
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
      <Link href="/like" className="gap-1 flex items-center group px-2">
        <IoHeartSharp size={20} />
        <span className="text-0.75 group-hover:w-[48px] overflow-hidden w-0 transition-all">
          MY&nbsp;LIKE
        </span>
      </Link>
      <Link href="/shopping-bag" className="gap-1 flex items-center group px-2">
        <IoBag size={20} />
        <span className="text-0.75 group-hover:w-[90px] overflow-hidden w-0 transition-all">
          SHOPPING&nbsp;BAG
        </span>
      </Link>

      {session ? (
        <>
          <Link href="/my-page" className="gap-1 flex items-center group px-2">
            <IoPerson size={20} />
            <span className="text-0.75 group-hover:w-[60px] overflow-hidden w-0 transition-all">
              MY&nbsp;PAGE
            </span>
          </Link>
          <LogoutButton />
        </>
      ) : (
        <Link href="/auth/login" className="gap-1 flex items-center group px-2">
          <IoLogIn size={20} />
          <span className="text-0.75 group-hover:w-[60px] overflow-hidden w-0 transition-all">
            LOGIN
          </span>
        </Link>
      )}
    </div>
  );
};

export default Header;
