'use client';

import ProductCard from '@/components/ProductCard';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Product } from '@/types/types';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

const FavoriteProducts = () => {
  const [favorite] = useLocalStorage<Record<number, boolean>>('favorite');

  const { data: favoriteProducts } = useQuery<Product[]>({
    queryKey: ['favoriteProducts'],
    queryFn: async () => {
      const params = new URLSearchParams();

      for (const key in favorite) {
        if (favorite.hasOwnProperty(key) && favorite[key] === true) {
          params.append('productId', key);
        }
      }

      return await (await fetch(`/api/products?${params.toString()}`)).json();
    },
  });

  return favoriteProducts?.map(product => (
    <ProductCard key={product.productId} product={product} />
  ));
};

export default FavoriteProducts;
