import { getRecentProducts } from '@/lib/database/product';
import { unstable_noStore } from 'next/cache';
import Image from 'next/image';
import HomeCarousel from './_components/Product/HomeCarousel';

export default async function HomePage() {
  unstable_noStore();
  const carouselProducts = await getRecentProducts();

  return (
    <div className="flex w-full flex-auto flex-col gap-10">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src="/images/banner/banner.webp"
          alt="배너이미지"
          fill
          className="object-cover"
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
