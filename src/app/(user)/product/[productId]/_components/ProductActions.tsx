'use client';

import { Button } from '@/components/ui/button';
import { toggleSavedProduct, useSavedProducts } from '@/lib/savedProducts';
import { useRouter } from 'next/navigation';

const ProductActions = ({ productId }: { productId: number }) => {
  const router = useRouter();
  const { saved: cart } = useSavedProducts('cart');

  const isInCart = cart[productId];

  const handleClickBuyNow = () => {
    if (!isInCart) toggleSavedProduct('cart', productId);
    router.push('/cart');
  };

  return (
    <>
      <Button
        variant="volt"
        size="lg"
        className="w-full"
        onClick={() => toggleSavedProduct('cart', productId)}
      >
        {isInCart ? 'REMOVE FROM CART' : 'ADD TO CART'}
      </Button>
      <Button
        variant="street-outline"
        size="lg"
        className="w-full"
        onClick={handleClickBuyNow}
      >
        BUY NOW
      </Button>
    </>
  );
};

export default ProductActions;
