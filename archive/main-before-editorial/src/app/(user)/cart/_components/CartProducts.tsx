'use client';

import ProductCard from '@/components/ProductCard';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Product } from '@/types/types';
import { useQuery } from '@tanstack/react-query';

const CartProducts = () => {
  const [cart] = useLocalStorage<Record<number, boolean>>('cart');

  const { data: cartProducts } = useQuery<Product[]>({
    queryKey: ['cartProducts'],
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(cart).forEach(([key, value]) => {
        if (value) {
          params.append('productId', key);
        }
      });

      return (await fetch(`/api/products?${params.toString()}`)).json();
    },
  });

  return cartProducts?.map(product => (
    <ProductCard key={product.productId} product={product} />
  ));
};

export default CartProducts;
