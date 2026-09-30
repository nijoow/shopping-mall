import { cn } from '@/lib/utils';
import Link from 'next/link';
import { AnchorHTMLAttributes } from 'react';

const ProductNavigationItem = ({
  text,
  href,
  className,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  text: string;
  className?: string;
}) => (
  <Link
    href={href ?? '#'}
    className={cn(
      'flex w-full items-center justify-center break-keep border border-border px-1 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:py-3.5',
      className,
    )}
    {...rest}
  >
    {text}
  </Link>
);

const ProductNavigation = ({ id }: { id: string }) => (
  <div id={id} className="flex w-full scroll-m-20">
    <ProductNavigationItem text="상품정보" href="#product-info" />
    <ProductNavigationItem
      text="결제/교환/배송정보"
      href="#payment-exchange-delivery-info"
      className="border-x-0"
    />
    <ProductNavigationItem text="상품문의 (0)" href="#product-inquiry" />
  </div>
);

export default ProductNavigation;
