import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/database/product';
import { Categories, Gender } from '@/types/types';
import { isColorFamily } from '@/utils/colorFamily';

export const revalidate = 0;

/** URL 세그먼트 → DB 카테고리 값 (표기가 다른 것만 명시) */
const SEGMENT_TO_CATEGORY: Record<string, string> = {
  acc: 'ACCESSORY',
};

export default async function ShopPage({
  params: { category },
  searchParams,
}: {
  params: { category: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const gender = ['MALE', 'FEMALE'].includes(searchParams.gender as string)
    ? (searchParams.gender as Gender)
    : undefined;
  const [minPrice, maxPrice] = String(searchParams.price ?? '')
    .split('-')
    .map(value => Number(value) || undefined);
  const colorParam = searchParams.color;
  const colorFamily =
    typeof colorParam === 'string' && isColorFamily(colorParam)
      ? colorParam
      : undefined;
  const keyword =
    typeof searchParams.q === 'string' && searchParams.q.trim()
      ? searchParams.q.trim()
      : undefined;

  const products = await getProducts({
    category: (
      SEGMENT_TO_CATEGORY[category.toLowerCase()] ?? category.toUpperCase()
    ) as Categories,
    gender,
    minPrice,
    maxPrice,
    keyword,
    colorFamily,
  });

  if (!products) throw new Error('Failed to fetch products');

  return (
    <div className="flex w-full flex-col gap-3">
      {keyword && (
        <p className="display px-4 text-0.875 tracking-widest text-muted-foreground sm:px-0">
          SEARCH “{keyword}” — {products.length} RESULTS
        </p>
      )}
      {products.length === 0 ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 py-24">
          <span className="display text-1.5 text-muted-foreground">
            NO DROPS YET
          </span>
          <p className="text-0.875 text-muted-foreground">
            조건에 맞는 상품이 없습니다. 필터를 조정해 보세요.
          </p>
        </div>
      ) : (
        <div className="grid h-fit w-full grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4">
          {products.map(product => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
