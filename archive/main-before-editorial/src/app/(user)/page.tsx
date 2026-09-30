import SubTitle from '@/components/SubTitle';
import { getRecentProducts } from '@/lib/database/product';
import { unstable_noStore } from 'next/cache';
import HomeCarousel from './_components/Product/HomeCarousel';

export default async function HomePage() {
  unstable_noStore();
  const carouselProducts = await getRecentProducts();

  return (
    <div className="flex w-full flex-auto flex-col">
      <section className="relative aspect-[16/9] w-full">
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
      </section>
      {carouselProducts && (
        <section className="mt-4 flex flex-col gap-2">
          <SubTitle className="px-3">Products</SubTitle>
          <HomeCarousel carouselProducts={[...carouselProducts]} />
        </section>
      )}
    </div>
  );
}
