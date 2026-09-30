import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PRODUCTS } from '@/domain/catalog';
import { ProductCard } from '@/components/commerce/ProductCard';
export default function Home() {
  return (
    <>
      <section className="editorial-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="red-dash" />
            THE NIJOOW EDIT — 01
          </div>
          <h1 className="hero-title">
            SNEAKER
            <br />
            EDIT<span className="red-dot">.</span>
          </h1>
          <p className="hero-intro">
            나만의 스타일을
            <br />
            다시 그리다.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/studio/runner">
              커스텀 시작 <ArrowUpRight size={18} />
            </Link>
            <Link className="button outline" href="/shop/sneakers">
              상품 보기
            </Link>
          </div>
        </div>
        <div className="hero-runner">
          <span className="hero-photo-backdrop" />
          <Image
            src="/editorial/runner.png?v=20260910"
            alt="FORM RUNNER — 나만의 색으로 완성하는 스니커즈"
            fill
            priority
            sizes="65vw"
          />
          <div className="editorial-caption">
            <span>01</span>
            <i />
            <Link href="/product/runner">FORM RUNNER ↗</Link>
          </div>
        </div>
        <div className="hero-side">
          <Link className="hero-low" href="/product/low">
            <Image
              src="/editorial/low-detail-v2.png?v=20260930"
              alt="EVERYDAY LOW의 소재와 디테일"
              fill
              priority
              sizes="30vw"
            />
            <span className="photo-label">02 — EVERYDAY LOW ↗</span>
          </Link>
          <Link className="hero-jacket" href="/product/field-jacket">
            <Image
              src="/editorial/jacket-photo.png?v=20260910"
              alt="FIELD JACKET"
              fill
              sizes="30vw"
            />
            <span className="vertical-note">
              DETAIL
              <br />
              SHAPES
              <br />
              YOUR
              <br />
              EVERYDAY.
            </span>
          </Link>
        </div>
      </section>
      <section className="curation-strip">
        <div className="curation-copy">
          <span className="eyebrow">— OUR SELECTION</span>
          <h2>
            지금, 새로운
            <br />
            균형을 입다<span>.</span>
          </h2>
          <Link href="/shop/all">
            컬렉션 둘러보기 <ArrowUpRight size={18} />
          </Link>
        </div>
        <Link className="curation-photo" href="/shop/clothing">
          <Image
            src="/editorial/jacket-photo.png?v=20260910"
            alt="의류 컬렉션"
            fill
            sizes="30vw"
          />
          <span>CLOTHING ↗</span>
        </Link>
        <Link className="curation-photo bag-photo" href="/shop/accessories">
          <Image
            src="/editorial/bag-photo.png?v=20260910"
            alt="가방과 잡화 컬렉션"
            fill
            sizes="30vw"
          />
          <span>OBJECTS ↗</span>
        </Link>
        <Link className="curation-detail" href="/studio/runner">
          <Image
            src="/editorial/runner-detail.png?v=20260910"
            alt="3D 스니커즈 디테일"
            fill
            sizes="20vw"
          />
          <span>MAKE IT YOURS ↗</span>
        </Link>
      </section>
      <section className="section-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CURATED FOR YOUR EVERYDAY</span>
            <h2>
              THE DAILY EDIT<span>.</span>
            </h2>
          </div>
          <Link className="text-link" href="/shop/all">
            모든 상품 <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="product-grid">
          {PRODUCTS.slice(0, 4).map((p, i) => (
            <ProductCard product={p} key={p.id} index={i} />
          ))}
        </div>
      </section>
      <section className="studio-banner">
        <span className="eyebrow">A PERSONAL PERSPECTIVE</span>
        <h2>
          YOUR COLOR.
          <br />
          YOUR SIGNATURE.
        </h2>
        <div>
          <p>
            색, 재질, 그리고 나만의 한 줄.
            <br />
            3D로 완성한 디자인을 저장하고 주문까지.
          </p>
          <Link className="button" href="/studio/runner">
            나의 디자인 시작하기 <ArrowUpRight size={18} />
          </Link>
        </div>
        <span className="banner-number">03</span>
      </section>
    </>
  );
}
