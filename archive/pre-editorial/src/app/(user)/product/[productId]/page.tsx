import { SAMPLE_TEXT } from '@/constant/sampleText';
import { getProductByProductId } from '@/lib/database/product';
import { commaToCurrency } from '@/utils';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FavoriteButton from './_components/FavoriteButton';
import ProductActions from './_components/ProductActions';
import ProductMedia from './_components/ProductMedia';
import ProductNavigation from './_components/ProductNavigation';

const SHIPPING_INFO = [
  { label: '배송비', value: '₩3,000 — ₩50,000 이상 무료' },
  { label: '출고', value: '평일 오후 2시 이전 주문 당일 출고' },
  { label: '교환/반품', value: '수령 후 7일 이내 가능' },
];

export default async function ProductPage({
  params: { productId },
}: {
  params: { productId: string };
}) {
  const product = (await getProductByProductId([Number(productId)]))?.[0];

  if (!product) notFound();

  const has3DPreview = product.category === 'SHOES';

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* 미디어 — 사진 / 3D 뷰어 */}
        <div className="w-full min-w-0 lg:flex-[5]">
          <ProductMedia
            imageUrl={product.imageUrl}
            productName={product.productName}
            colors={product.colors}
            has3DPreview={has3DPreview}
          />
        </div>

        {/* 정보 패널 */}
        <aside className="w-full lg:flex-[4]">
          <div className="flex flex-col gap-6 lg:sticky lg:top-20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="eyebrow">{product.category}</span>
                <h1 className="display text-1.75 leading-tight sm:text-2">
                  {product.productName}
                </h1>
                <div className="display text-1.5 text-volt">
                  ₩{commaToCurrency(product.price)}
                </div>
              </div>
              <FavoriteButton productId={product.productId} />
            </div>

            <p className="text-0.875 leading-relaxed text-muted-foreground">
              {product.description ?? SAMPLE_TEXT}
            </p>

            <div className="flex flex-col gap-2.5">
              <span className="eyebrow">COLOR</span>
              <div className="flex gap-2">
                {product.colors.map(color => (
                  <span
                    key={color}
                    className="h-8 w-8 border border-input"
                    style={{ backgroundColor: color }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>

            <ProductActions
              productId={product.productId}
              sizes={product.sizes}
            />

            {has3DPreview && (
              <Link
                href="/3d-shop"
                className="street-card street-card-hover flex items-center justify-between gap-3 p-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="display text-0.875 tracking-widest">
                    <span className="text-volt">3D LAB</span>에서 내 컬러로 커스텀
                  </span>
                  <span className="text-0.75 text-muted-foreground">
                    파트별 컬러부터 힐 태그 넘버까지 실시간으로.
                  </span>
                </div>
                <span aria-hidden className="display text-1 text-volt">
                  →
                </span>
              </Link>
            )}

            <dl className="flex flex-col divide-y divide-border border-y border-border text-0.875">
              {SHIPPING_INFO.map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4 py-3">
                  <dt className="shrink-0 text-muted-foreground">{label}</dt>
                  <dd className="text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      {/* 상세 정보 */}
      <div className="flex flex-col">
        <ProductNavigation id="product-info" />
        <section className="relative mx-auto my-10 aspect-square w-full max-w-3xl overflow-hidden bg-[#f4f2ec]">
          <Image
            src={product.imageUrl}
            alt={product.productName}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-contain"
          />
        </section>
        <ProductNavigation id="payment-exchange-delivery-info" />
        <section className="mx-auto w-full max-w-3xl py-10 leading-relaxed text-muted-foreground">
          {SAMPLE_TEXT}
          <br />
          <br />
          {SAMPLE_TEXT}
        </section>
        <ProductNavigation id="product-inquiry" />
        <section className="flex flex-col items-center gap-2 py-16 text-center">
          <span className="display text-1 tracking-widest text-muted-foreground">
            NO INQUIRIES YET
          </span>
          <p className="text-0.875 text-muted-foreground">
            아직 등록된 문의가 없어요.
          </p>
        </section>
      </div>
    </div>
  );
}
