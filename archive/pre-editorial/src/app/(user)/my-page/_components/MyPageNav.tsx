'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_SECTIONS = [
  {
    title: 'ACCOUNT',
    links: [
      { href: '/my-page', label: '대시보드' },
      { href: '/my-page/information', label: '회원정보' },
      { href: '/my-page/addresses', label: '배송지 관리' },
    ],
  },
  {
    title: 'SHOPPING',
    links: [
      { href: '/like', label: '위시리스트' },
      { href: '/cart', label: '장바구니' },
      { href: '/3d-shop', label: '3D 커스텀 랩' },
    ],
  },
];

const MyPageNav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-8 overflow-x-auto sm:flex-col">
      {NAV_SECTIONS.map(({ title, links }) => (
        <div key={title} className="flex flex-col gap-2">
          <span className="display text-0.75 tracking-widest text-muted-foreground">
            {title}
          </span>
          <ul className="flex flex-row gap-2 sm:flex-col sm:gap-1">
            {links.map(({ href, label }) => {
              const isActive = pathname === href;

              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'block whitespace-nowrap border-l-2 py-1 pl-3 text-0.875 transition-colors',
                      isActive
                        ? 'border-volt font-bold text-foreground'
                        : 'border-transparent text-muted-foreground hover:border-border/30 hover:text-foreground',
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default MyPageNav;
