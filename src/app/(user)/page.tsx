import { getRecentProducts } from '@/lib/database/product';
import { unstable_noStore } from 'next/cache';
import HomeCarousel from './_components/Product/HomeCarousel';

export default async function HomePage() {
  unstable_noStore();
  const carouselProducts = await getRecentProducts();

  return (
    <div className="flex w-full flex-auto flex-col gap-10">
      <div className="relative aspect-[16/9] w-full">
        <video className="w-full" autoPlay loop muted>
          <source
            src="https://d340a4zb19l6y1.cloudfront.net/24ss/editorial/bang-olufsen/editorial_01.mp4"
            type="video/mp4"
          />
          <track
            src="captions_en.vtt"
            kind="captions"
            srcLang="ko"
            label="caption"
          />
        </video>
      </div>
      {carouselProducts && (
        <HomeCarousel carouselProducts={[...carouselProducts]} />
      )}
    </div>
  );
}
