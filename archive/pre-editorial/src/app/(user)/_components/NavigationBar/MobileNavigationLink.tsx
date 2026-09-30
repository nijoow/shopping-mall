'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const MobileNavigationLink = ({
  href,
  icon,
  text,
}: {
  href: string;
  icon: ReactNode;
  text: string;
}) => {
  const pathname = usePathname();
  // 첫 세그먼트 기준으로 활성 판정 — /shop/all 링크는 /shop/* 전체에서 활성
  const baseSegment = `/${href.split('/')[1] ?? ''}`;
  const isActive =
    href === '/' ? pathname === '/' : pathname.startsWith(baseSegment);

  return (
    <Link
      href={href}
      className={cn(
        'relative col-span-1 flex h-full flex-col items-center justify-center gap-1 px-2 py-1 transition-colors',
        isActive ? 'text-volt' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {isActive && (
        <span aria-hidden className="absolute inset-x-4 top-0 h-0.5 bg-volt" />
      )}
      {icon}
      <span className="display text-0.625 tracking-wider">{text}</span>
    </Link>
  );
};

export default MobileNavigationLink;
