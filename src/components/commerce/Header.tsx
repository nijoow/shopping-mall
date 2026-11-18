'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  UserRound,
  X,
  ArrowUpRight,
  Menu,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useState, type FormEvent } from 'react';
import { useDemo } from './DemoProvider';

const links = [
  ['쇼핑', '/shop/all'],
  ['스니커즈', '/shop/sneakers'],
  ['의류', '/shop/clothing'],
  ['잡화', '/shop/accessories'],
  ['내 디자인', '/designs'],
];
export function Header() {
  const pathname = usePathname(),
    router = useRouter(),
    { state } = useDemo();
  const [search, setSearch] = useState(false),
    [menu, setMenu] = useState(false),
    [query, setQuery] = useState('');
  if (pathname.startsWith('/studio/')) return null;
  const total = state?.cart.reduce((n, l) => n + l.quantity, 0) ?? 0;
  function submit(e: FormEvent) {
    e.preventDefault();
    router.push(`/shop/all?q=${encodeURIComponent(query.trim())}`);
    setSearch(false);
  }
  return (
    <>
      <a href="#main-content" className="skip-link">
        본문으로 건너뛰기
      </a>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="NIJOOW 홈">
          NIJOOW
        </Link>
        <nav className="desktop-nav" aria-label="주 메뉴">
          {links.map(([name, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
            >
              {name}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Dialog.Root open={search} onOpenChange={setSearch}>
            <Dialog.Trigger asChild>
              <button className="icon-button" aria-label="검색">
                <Search size={21} />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="dialog-overlay" />
              <Dialog.Content className="search-dialog">
                <div className="dialog-top">
                  <Dialog.Title className="display">
                    FIND YOUR EDIT.
                  </Dialog.Title>
                  <Dialog.Close className="icon-button" aria-label="검색 닫기">
                    <X />
                  </Dialog.Close>
                </div>
                <Dialog.Description>
                  제품 이름이나 컬렉션을 찾아봐.
                </Dialog.Description>
                <form onSubmit={submit}>
                  <label htmlFor="site-search">검색어</label>
                  <div className="search-input">
                    <input
                      id="site-search"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="러너, 재킷, 가방…"
                    />
                    <button
                      className="icon-button"
                      type="submit"
                      aria-label="검색 실행"
                    >
                      <ArrowUpRight />
                    </button>
                  </div>
                </form>
                <div className="search-suggestions">
                  {['러너', '로우탑', '재킷'].map(q => (
                    <button
                      key={q}
                      onClick={() => {
                        router.push(`/shop/all?q=${encodeURIComponent(q)}`);
                        setSearch(false);
                      }}
                    >
                      {q} ↗
                    </button>
                  ))}
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <Link
            href="/like"
            className="icon-button optional-action"
            aria-label="위시리스트"
          >
            <Heart size={20} />
          </Link>
          <Link
            href="/cart"
            className="icon-button bag-link"
            aria-label={`장바구니 ${total}개`}
          >
            <ShoppingBag size={21} />
            {total > 0 && <span className="bag-count">{total}</span>}
          </Link>
          <Link
            href="/my-page"
            className="icon-button optional-action"
            aria-label="내 공간"
          >
            <UserRound size={20} />
          </Link>
          <Dialog.Root open={menu} onOpenChange={setMenu}>
            <Dialog.Trigger asChild>
              <button className="icon-button mobile-only" aria-label="메뉴">
                <Menu size={22} />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="dialog-overlay" />
              <Dialog.Content className="menu-dialog">
                <div className="dialog-top">
                  <Dialog.Title className="wordmark">NIJOOW</Dialog.Title>
                  <Dialog.Close className="icon-button" aria-label="메뉴 닫기">
                    <X />
                  </Dialog.Close>
                </div>
                <Dialog.Description className="eyebrow">
                  YOUR EVERYDAY, REEDITED.
                </Dialog.Description>
                <nav>
                  {[
                    ...links,
                    ['내 공간', '/my-page'],
                    ['위시리스트', '/like'],
                  ].map(([name, href]) => (
                    <Link key={href} href={href} onClick={() => setMenu(false)}>
                      {name}
                      <ArrowUpRight />
                    </Link>
                  ))}
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/studio/')) return null;
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Link href="/" className="footer-mark">
          NIJOOW
        </Link>
        <p>
          익숙한 것들의 새로운 조합.
          <br />A SELECT SHOP FOR YOUR EVERYDAY.
        </p>
        <Link href="/studio/runner">
          나의 디자인 시작하기 <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="footer-bottom">
        <span>PORTFOLIO DEMO · 실제 결제와 배송은 발생하지 않아.</span>
        <Link href="/about">프로젝트 · 에셋 안내</Link>
        <span>© NIJOOW 2026</span>
      </div>
    </footer>
  );
}
