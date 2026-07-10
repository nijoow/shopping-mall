'use client';

import ProductCard from '@/components/ProductCard';
import Spinner from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { useProductsByIds } from '@/hooks/useProductsByIds';
import { useSavedProducts } from '@/lib/savedProducts';
import Link from 'next/link';

const EmptyFavorites = () => (
  <div className="street-card flex flex-col items-center gap-3 px-6 py-16 text-center">
    <span className="display text-1.25 text-muted-foreground">
      NOTHING LIKED YET
    </span>
    <p className="text-0.875 text-muted-foreground">
      하트를 눌러 마음에 드는 아이템을 저장해보세요.
    </p>
    <Button asChild variant="volt" className="mt-2">
      <Link href="/shop/all">SHOP NOW</Link>
    </Button>
  </div>
);

const FavoriteProducts = () => {
  const { saved: favorite, savedIds, isHydrated } = useSavedProducts('favorite');
  const { data: products, isLoading } = useProductsByIds(
    'favoriteProducts',
    savedIds,
  );

  if (!isHydrated || (isLoading && savedIds.length > 0)) {
    return (
      <div className="flex w-full justify-center py-24">
        <Spinner width={32} />
      </div>
    );
  }

  const favoriteProducts = (products ?? []).filter(
    ({ productId }) => favorite[productId],
  );

  if (favoriteProducts.length === 0) return <EmptyFavorites />;

  return (
    <div className="grid h-fit w-full grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4">
      {favoriteProducts.map(product => (
        <ProductCard key={product.productId} product={product} />
      ))}
    </div>
  );
};

export default FavoriteProducts;
