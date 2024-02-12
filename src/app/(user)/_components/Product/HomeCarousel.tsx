'use client';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { commaToCurrency } from '@/lib/utils/commaToCurrency';
import { ScrollContainer } from 'react-indiana-drag-scroll';
import { Product } from '@/types/types';

const HomeCarousel = ({
  carouselProducts,
}: {
  carouselProducts: Product[];
}) => {
  const targetRef = useRef(null);
  const [onAnimation, setOnAnimation] = useState(true);

  useEffect(() => {
    const container = targetRef.current;

    if (!container) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('1');
          setOnAnimation(false);
        } else {
          console.log('2');
          setOnAnimation(true);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.5,
    });

    observer.observe(container);

    return () => {
      observer.unobserve(container);
    };
  }, [targetRef]);

  return (
    <ScrollContainer
      hideScrollbars
      className="w-full overflow-x-auto pb-6 pt-1 scrollbar-hide"
    >
      <ul
        className={clsx('flex gap-4 flex-auto items-center', {
          'animate-slide': onAnimation,
        })}
      >
        {carouselProducts.map((product, i) => (
          <li
            key={`${product.productId}`}
            className="aspect-square flex-none w-1/3 max-w-[360px]"
          >
            <Link
              href={`/product/${product.productId}`}
              className={clsx(
                'flex flex-col h-full w-full transition duration-300 ease-in-out hover:scale-105 p-3 shadow-sm hover:shadow-md relative justify-between overflow-hidden rounded-lg border bg-white',
              )}
            >
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={product.productImageUrl}
                  alt={product.productName}
                  fill
                  sizes="30vw"
                  className={clsx('relative h-full w-full object-contain')}
                />
              </div>
              <div className="flex gap-3 py-3 justify-between">
                <span className="font-medium">{product.productName}</span>
                <span className="text-gray-400">
                  ₩{commaToCurrency(product.price)}
                </span>
              </div>
            </Link>
          </li>
        ))}
        <div ref={targetRef} className="w-1 h-1 flex-none ml-auto" />
      </ul>
    </ScrollContainer>
  );
};

export default HomeCarousel;
