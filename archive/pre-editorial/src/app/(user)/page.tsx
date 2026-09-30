import { getRecentProducts } from '@/lib/database/product';
import { unstable_noStore } from 'next/cache';
import Image from 'next/image';
import Link from 'next/link';
import HomeCarousel from './_components/Product/HomeCarousel';

const MARQUEE_ITEMS = [
  'STREET CASUAL',
  'NIJOOW ORIGINALS',
  '3D CUSTOM LAB',
  'FREE SHIPPING OVER ₩50,000',
  'SEOUL BASED',
];

const CATEGORIES = [
  { href: '/shop/outer', label: 'OUTER' },
  { href: '/shop/top', label: 'TOP' },
  { href: '/shop/bottom', label: 'BOTTOM' },
  { href: '/shop/shoes', label: 'SHOES' },
  { href: '/shop/acc', label: 'ACC' },
];

const Marquee = () => (
  <div
    aria-hidden
    className="flex w-full overflow-hidden border-y border-ink/15 bg-volt py-2"
  >
    <div className="flex min-w-max animate-marquee items-center gap-8 pr-8">
      {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={`${item}-${i}`} className="display flex items-center gap-8 text-0.875 tracking-widest text-ink">
          {item}
          <span className="inline-block h-2 w-2 rotate-45 bg-ink" />
        </span>
      ))}
    </div>
  </div>
);

export default async function HomePage() {
  unstable_noStore();
  const carouselProducts = await getRecentProducts();

  return (
    <div className="flex w-full flex-auto flex-col">
      {/* 히어로 — 미드나잇 스트릿 */}
      <section className="relative flex min-h-[70dvh] w-full flex-col justify-center overflow-hidden bg-[#0b0b0c] px-6 py-20 sm:px-12">
        <Image
          src="/images/hero-grid.svg"
          alt=""
          fill
          priority
          unoptimized
          className="pointer-events-none object-cover opacity-70"
        />
        <div className="relative z-10 flex max-w-4xl flex-col gap-6 animate-fade-up">
          <span className="display w-fit border-2 border-volt px-3 py-1 text-0.75 tracking-[0.25em] text-volt">
            2026 SUMMER DROP
          </span>
          <h1 className="display text-3.5 leading-[0.95] text-white sm:text-5.5">
            WEAR THE
            <br />
            <span className="text-outline text-volt">STREET,</span>
            <br />
            OWN THE <span className="text-volt">CITY</span>
          </h1>
          <p className="max-w-md text-0.875 leading-relaxed text-white/70">
            스트릿캐쥬얼 셀렉트샵 NIJOOW. 시즌 신상부터 3D 커스텀 스니커즈까지,
            거리의 무드를 그대로 입다.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop/all"
              className="display border-2 border-volt bg-volt px-6 py-3 text-0.875 tracking-widest text-ink transition-transform hover:-translate-y-0.5"
            >
              SHOP NOW
            </Link>
            <Link
              href="/3d-shop"
              className="display border-2 border-white/80 px-6 py-3 text-0.875 tracking-widest text-white transition-all hover:border-volt hover:text-volt"
            >
              3D CUSTOM LAB →
            </Link>
          </div>
        </div>
        <Image
          src="/images/sticker-3d.svg"
          alt="3D CUSTOM"
          width={110}
          height={110}
          unoptimized
          className="absolute right-8 top-8 rotate-12 sm:right-16 sm:top-16"
        />
      </section>

      <Marquee />

      {/* 신상품 캐러셀 */}
      {carouselProducts && (
        <section className="mx-auto mt-12 flex w-full max-w-7xl flex-col gap-3">
          <div className="flex items-end justify-between px-4 sm:px-6">
            <h2 className="display text-1.75 leading-none">
              NEW <span className="text-outline">DROPS</span>
            </h2>
            <Link
              href="/shop/all"
              className="display text-0.75 tracking-widest text-muted-foreground transition-colors hover:text-volt"
            >
              VIEW ALL →
            </Link>
          </div>
          <HomeCarousel carouselProducts={[...carouselProducts]} />
        </section>
      )}

      {/* 카테고리 타일 */}
      <section className="mx-auto mt-14 flex w-full max-w-7xl flex-col gap-3 px-4 sm:px-6">
        <h2 className="display text-1.75 leading-none">
          SHOP BY <span className="text-outline">CATEGORY</span>
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {CATEGORIES.map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              className="street-card street-card-hover group relative flex aspect-[4/3] items-end p-3 sm:aspect-[3/4]"
            >
              <span className="display absolute right-2 top-2 text-0.75 text-muted-foreground">
                0{i + 1}
              </span>
              <span className="display text-1.125 transition-colors group-hover:text-volt">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3D 커스텀 랩 프로모 배너 */}
      <section className="mx-auto my-14 w-full max-w-7xl px-4 sm:px-6">
        <Link
          href="/3d-shop"
          className="group relative flex flex-col gap-4 overflow-hidden border border-border bg-[#090d16] p-8 transition-all hover:border-volt/60 hover:shadow-street sm:p-12"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-neon-pink/25 blur-3xl transition-opacity group-hover:opacity-80" />
          <div className="pointer-events-none absolute -bottom-10 left-1/3 h-48 w-48 rounded-full bg-neon-cyan/20 blur-3xl" />
          <span className="display w-fit bg-volt px-2 py-0.5 text-0.75 tracking-widest text-ink">
            INTERACTIVE
          </span>
          <h2 className="display relative text-2 leading-tight text-white sm:text-3">
            나만의 스니커즈를
            <br />
            <span className="text-volt">실시간 3D</span>로 커스텀
          </h2>
          <p className="relative max-w-lg text-0.875 text-white/70">
            7개 파트 컬러 커스텀, 시그니처 컬러웨이, 힐 태그 넘버까지. 완성한
            디자인은 URL로 공유하거나 스냅샷으로 저장할 수 있어요.
          </p>
          <span className="display relative w-fit border-b-2 border-volt pb-1 text-0.875 tracking-widest text-volt">
            ENTER THE LAB →
          </span>
        </Link>
      </section>
    </div>
  );
}
