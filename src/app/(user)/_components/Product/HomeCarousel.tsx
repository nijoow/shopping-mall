import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { commaToCurrency } from '@/lib/utils/commaToCurrency';

type Product = {
  productId: number;
  productName: string;
  price: number;
  productImageUrl: string;
};
const HomeCarousel = async () => {
  const images = await fetch(
    `https://api.thecatapi.com/v1/images/search?limit=${10}`,
  );
  const data = await images.json();
  const carouselProducts: Product[] = data.map(
    ({ url }: { url: string }, index: number) => ({
      productId: index,
      productName: `상품명${index}`,
      price: 10900 * index,
      productImageUrl: url,
    }),
  );

  return (
    <div className="w-full overflow-x-auto pb-6 pt-1">
      <ul className="flex animate-slide gap-4">
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
      </ul>
    </div>
  );
};

export default HomeCarousel;
