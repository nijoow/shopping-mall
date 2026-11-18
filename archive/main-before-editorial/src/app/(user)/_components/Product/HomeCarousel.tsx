'use client';

import { Product } from '@/types/types';
import { commaToCurrency } from '@/utils';
import clsx from 'clsx';
import { motion } from 'framer-motion';
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
      className="scrollbar-hide h-fit w-full overflow-x-auto"
    >
      <ul
        className={clsx(
          'direct grid flex-auto grid-cols-2 items-center gap-2 p-3 sm:flex sm:gap-4',
          {
            'sm:animate-slide': onAnimation,
          },
        )}
      >
        {carouselProducts.map((product, i) => (
          <motion.li
            key={`${product.productId}`}
            className="col-span-1 h-full w-full max-w-[360px] flex-none sm:col-span-1 sm:w-1/3"
            whileHover={{ scale: 1.03 }}
          >
            <Link
              href={`/product/${product.productId}`}
              className={clsx(
                'relative flex h-full w-full flex-col justify-between overflow-hidden rounded-lg border bg-white p-3 shadow-sm',
              )}
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={product.imageUrl}
                  alt={product.productName}
                  fill
                  sizes="30vw"
                  className={clsx('relative h-full w-full object-contain')}
                />
              </div>
              <div className="flex flex-col justify-between gap-0.5 sm:flex-row sm:gap-3 sm:py-3">
                <span className="font-medium text-gray-950">
                  {product.productName}
                </span>
                <span className="text-gray-400">
                  ₩{commaToCurrency(product.price)}
                </span>
              </div>
            </Link>
          </motion.li>
        ))}
        <div ref={targetRef} className="ml-auto h-1 w-1 flex-none" />
      </ul>
    </ScrollContainer>
  );
}

export default HomeCarousel;
