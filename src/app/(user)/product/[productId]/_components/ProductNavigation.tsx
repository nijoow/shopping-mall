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
      'flex w-full items-center justify-center break-keep border-2 border-black px-1 py-2 text-sm text-black md:py-4 md:text-base',
      className,
    )}
    {...rest}
  >
    {text}
  </Link>
);

const ProductNavigation = ({ id }: { id: string }) => (
  <div id={id} className="col-span-12 flex w-full scroll-m-24">
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
