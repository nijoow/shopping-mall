import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import React from 'react';
import FilterDrawer from '../_components/FilterDrawer';
import Filter from '../_components/Filter';
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

  const products = await getProducts({
    category: category.toLocaleUpperCase() as Categories,
    gender,
    minPrice: minPrice,
    maxPrice: maxPrice,
    colors,
  });

  if (!products) throw new Error('Failed to fetch products');

  return (
    <div className="flex h-full w-full flex-col py-4 sm:flex-row sm:p-8">
      <div className="flex h-full w-full flex-col gap-2 sm:w-64 sm:gap-8 sm:pr-4">
        <span className="pl-4 text-1.5 font-semibold sm:pl-0">SHOP</span>
        <div className="flex w-full flex-row gap-2 overflow-x-auto sm:flex-col sm:gap-0">
          {['ALL', 'OUTER', 'TOP', 'BOTTOM', 'SHOES', 'ACC'].map(category => (
            <Link
              href={category.toLocaleLowerCase()}
              key={category}
              className="my-1.5 px-2 font-light text-gray-500"
            >
              {category}
            </Link>
          ))}
        </div>
        <div className="hidden flex-col gap-2 sm:flex">
          <Filter />
        </div>
        <FilterDrawer />
      </div>
      <div className="grid h-fit w-full grid-cols-12 border-l border-t ">
        {products.map(product => (
          <ProductCard key={product.productId} product={product} />
        ))}
      </div>
    </div>
  );
}
