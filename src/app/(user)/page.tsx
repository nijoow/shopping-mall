import Image from 'next/image';
import React from 'react';
import HomeCarousel from './_components/Product/HomeCarousel';
import { getRecentProducts } from '@/lib/database/product';
import { unstable_noStore } from 'next/cache';

export default async function HomePage() {
  unstable_noStore();
  const carouselProducts = await getRecentProducts();

  return (
    <div className="flex h-full w-full flex-col gap-10">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={'/images/banner/main.jpg'}
          alt="배너이미지"
          fill
          className="object-cover object-[0_58%]"
        />
      </div>
      {carouselProducts && (
        <HomeCarousel
          carouselProducts={[
            ...carouselProducts,
            ...carouselProducts,
            ...carouselProducts,
            ...carouselProducts,
            ...carouselProducts,
            ...carouselProducts,
          ]}
        />
      )}
    </div>
  );
}
