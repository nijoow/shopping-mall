import Image from 'next/image';
import React from 'react';
import HomeCarousel from './_components/Product/HomeCarousel';
import { Product } from '@/types/types';

export default async function HomePage() {
  const carouselProducts: Product[] = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(
    (_, index: number) => ({
      productId: index,
      productName: `상품명${index}`,
      price: 10900 * index,
      productImageUrl: '/images/product/example.png',
    }),
  );

  return (
    <div className="flex flex-col w-full h-full gap-10">
      <div className="w-full aspect-[16/9] relative">
        <Image
          src={'/images/banner/main.jpg'}
          alt="배너이미지"
          fill
          className="object-cover object-[0_58%]"
        />
      </div>
      <HomeCarousel carouselProducts={carouselProducts} />
    </div>
  );
}
