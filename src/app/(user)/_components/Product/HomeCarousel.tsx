'use client';

import { Product } from '@/types/types';
import { commaToCurrency } from '@/utils';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ScrollContainer } from 'react-indiana-drag-scroll';

function HomeCarousel({ carouselProducts }: { carouselProducts: Product[] }) {
  const targetRef = useRef(null);
  const [onAnimation, setOnAnimation] = useState(true);

  useEffect(() => {
    const container = targetRef.current;

    if (!container) return undefined;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setOnAnimation(false);
        } else {
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
      className="scrollbar-hide w-full overflow-x-auto pb-6 pt-1"
    >
      <ul
        className={clsx('flex flex-auto items-center gap-4', {
          'animate-slide': onAnimation,
        })}
      >
        {carouselProducts.map((product, i) => (
          <li
            key={`${product.productId}`}
            className="aspect-square w-2/3 max-w-[360px] flex-none sm:w-1/3"
          >
            <Link
              href={`/product/${product.productId}`}
              className={clsx(
                'relative flex h-full w-full flex-col justify-between overflow-hidden rounded-lg border bg-white p-3 shadow-sm transition duration-300 ease-in-out hover:scale-105 hover:shadow-md',
              )}
            >
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={product.imageUrl}
                  alt={product.productName}
                  fill
                  sizes="30vw"
                  className={clsx('relative h-full w-full object-contain')}
                />
              </div>
              <div className="flex flex-col justify-between gap-0.5 sm:flex-row sm:gap-3 sm:py-3">
                <span className="font-medium">{product.productName}</span>
                <span className="text-gray-400">
                  ₩{commaToCurrency(product.price)}
                </span>
              </div>
            </Link>
          </li>
        ))}
        <div ref={targetRef} className="ml-auto h-1 w-1 flex-none" />
      </ul>
    </ScrollContainer>
  );
}

export default HomeCarousel;
