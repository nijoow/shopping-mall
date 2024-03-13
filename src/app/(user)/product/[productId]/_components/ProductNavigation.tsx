import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import React, { AnchorHTMLAttributes, Attributes } from 'react';

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
      'w-full py-2 md:py-4 px-1 break-keep text-sm md:text-base flex items-center justify-center border-2 text-black border-black',
      className,
    )}
    {...rest}
  >
    {text}
  </Link>
);

const ProductNavigation = ({ id }: { id: string }) => {
  return (
    <div id={id} className="col-span-12 flex w-full pt-14">
      <ProductNavigationItem text="상품정보" href="#product-info" />
      <ProductNavigationItem
        text="결제/교환/배송정보"
        href="#payment-exchange-delivery-info"
        className="border-x-0"
      />
      <ProductNavigationItem text="상품문의 (0)" href="#product-inquiry" />
    </div>
  );
};

export default ProductNavigation;
