'use client';

import { Product } from '@/types/types';
import { useQuery } from '@tanstack/react-query';

/** productId 목록으로 상품 정보를 조회한다. 빈 목록이면 요청하지 않는다. */
export const useProductsByIds = (queryKey: string, productIds: number[]) =>
  useQuery<Product[]>({
    queryKey: [queryKey, ...productIds],
    queryFn: async () => {
      const params = new URLSearchParams();
      productIds.forEach(id => params.append('productId', String(id)));

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');

      return response.json();
    },
    enabled: productIds.length > 0,
  });
