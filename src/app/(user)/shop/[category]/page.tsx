import ProductCard from '@/components/ProductCard';
import React from 'react';
import { getProducts } from '@/lib/database/product';
import { Categories, Gender } from '@/types/types';

export default async function ShopPage({
  params: { category },
  searchParams,
}: {
  params: { category: Categories };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const gender = ['MALE', 'FEMALE'].includes(searchParams.gender as string)
    ? (searchParams.gender as Gender)
    : undefined;
  const [minPrice, maxPrice] = String(searchParams.price)
    .split('-')
    .map(v => Number(v) || undefined);
  const colors =
    typeof searchParams.colors === 'string'
      ? [searchParams.colors]
      : searchParams.colors;
  setTimeout(() => {}, 1000);
  const products = await getProducts({
    category: category.toLocaleUpperCase() as Categories,
    gender,
    minPrice: minPrice,
    maxPrice: maxPrice,
    colors,
  });

  if (!products) throw new Error('Failed to fetch products');

  return (
    <div className="grid h-fit w-full grid-cols-12 border-l border-t ">
      {products.map(product => (
        <ProductCard key={product.productId} product={product} />
      ))}
    </div>
  );
}