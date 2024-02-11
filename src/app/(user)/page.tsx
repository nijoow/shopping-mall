import Image from 'next/image';
import React from 'react';
import HomeCarousel from './_components/Product/HomeCarousel';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full h-full gap-10">
      <div className="w-full h-[800px] relative">
        <Image
          src={'/images/banner/main.jpg'}
          alt="배너이미지"
          fill
          className="object-cover object-[0_58%]"
        />
      </div>
      <HomeCarousel />
    </div>
  );
}
