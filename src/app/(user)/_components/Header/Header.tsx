import { auth } from 'auth';
import Image from 'next/image';
import Link from 'next/link';
import { IoBag, IoHeartSharp, IoLogIn, IoPerson } from 'react-icons/io5';
import LogoutButton from './LogoutButton';
import Search from './Search';

const Header = async () => {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-b-gray-300 bg-white">
      <div className="mx-auto flex w-full items-center px-4">
        <Link href="/" className="relative mr-4 h-[54px] w-[96px]">
          <Image src="/images/logo/nijoow.svg" alt="nijoow logo" fill />
        </Link>
        <Link href="/shop/all" className="hidden px-2 sm:block">
          SHOP
        </Link>
        {/* <Link href="/top" className="hidden px-2 sm:block">
          TOP
        </Link>
        <Link href="/features" className="hidden px-2 sm:block">
          FEATURES
        </Link> */}
        <div className="flex-auto" />
        {/* <div className="flex items-center">
          <span className="text-0.75">Language</span>
          <IoChevronForward size={16} />
        </div> */}
        <Search />
        <Link href="/like" className="group items-center gap-1 px-2 sm:flex">
          <IoHeartSharp size={20} />
          <span className="hidden text-0.75 md:block">MY&nbsp;LIKE</span>
        </Link>
        <Link
          href="/cart"
          className="group hidden items-center gap-1 px-2 sm:flex"
        >
          <IoBag size={20} />
          <span className="hidden text-0.75 md:block">CART</span>
        </Link>

        {session ? (
          <>
            <Link
              href="/my-page"
              className="group hidden items-center gap-1 px-2 sm:flex"
            >
              <IoPerson size={20} />
              <span className="hidden text-0.75 md:block">MY&nbsp;PAGE</span>
            </Link>
            <LogoutButton />
          </>
        ) : (
          <Link
            href="/auth/login"
            className="group hidden items-center gap-1 px-2 sm:flex"
          >
            <IoLogIn size={20} />
            <span className="hidden text-0.75 md:block">LOGIN</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
