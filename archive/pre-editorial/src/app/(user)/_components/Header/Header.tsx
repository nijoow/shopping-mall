import Logo from '@/components/Logo';
import { auth } from 'auth';
import Link from 'next/link';
import { IoHeartOutline, IoLogInOutline, IoPersonOutline } from 'react-icons/io5';
import CartLink from './CartLink';
import LogoutButton from './LogoutButton';
import Search from './Search';

const iconLinkClass =
  'flex h-10 w-10 items-center justify-center transition-colors hover:text-volt';

const Header = async () => {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center px-4 sm:px-6">
        <Link href="/" className="mr-5 flex items-center" aria-label="NIJOOW 홈">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            href="/shop/all"
            className="display px-2.5 py-1 text-0.875 tracking-wider transition-colors hover:text-volt"
          >
            SHOP
          </Link>
          <Link
            href="/3d-shop"
            className="display bg-volt px-2.5 py-1 text-0.875 tracking-wider text-ink transition-shadow hover:shadow-street-fg"
          >
            3D LAB
          </Link>
        </nav>

        <div className="flex-auto" />

        <div className="flex items-center">
          <Search />
          <Link href="/like" aria-label="위시리스트" className={iconLinkClass}>
            <IoHeartOutline size={20} />
          </Link>
          <CartLink />

          {session ? (
            <>
              <Link href="/my-page" aria-label="마이페이지" className={iconLinkClass}>
                <IoPersonOutline size={20} />
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/auth/login" aria-label="로그인" className={iconLinkClass}>
              <IoLogInOutline size={20} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
