'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const CATEGORIES = ['ALL', 'OUTER', 'TOP', 'BOTTOM', 'SHOES', 'ACC'];

const CategoryNav = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return (
    <nav className="scrollbar-hide flex gap-1.5 overflow-x-auto">
      {CATEGORIES.map(category => {
        const href = `/shop/${category.toLowerCase()}${query ? `?${query}` : ''}`;
        const isActive = pathname === `/shop/${category.toLowerCase()}`;

        return (
          <Link
            key={category}
            href={href}
            className={cn(
              'display whitespace-nowrap border px-3.5 py-1.5 text-0.75 tracking-widest transition-colors',
              isActive
                ? 'border-volt bg-volt text-ink'
                : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
            )}
          >
            {category}
          </Link>
        );
      })}
    </nav>
  );
};

export default CategoryNav;
