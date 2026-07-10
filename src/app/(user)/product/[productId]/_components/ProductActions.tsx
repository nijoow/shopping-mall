'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { addToCart, useCart } from '@/lib/savedProducts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ProductActions = ({
  productId,
  sizes,
}: {
  productId: number;
  sizes: string[];
}) => {
  const router = useRouter();
  const { cart } = useCart();

  const hasSizes = sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState<string | null>(
    hasSizes ? null : null,
  );
  const [error, setError] = useState(false);

  const inCartCount = cart
    .filter(line => line.productId === productId)
    .reduce((sum, line) => sum + line.quantity, 0);

  const handleAddToCart = (thenGoToCart: boolean) => {
    if (hasSizes && !selectedSize) {
      setError(true);
      return;
    }
    addToCart({ productId, quantity: 1, size: selectedSize });
    if (thenGoToCart) router.push('/cart');
  };

  return (
    <div className="flex flex-col gap-4">
      {hasSizes && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="eyebrow">SIZE</span>
            {error && (
              <span className="text-0.75 text-destructive">
                사이즈를 선택해주세요
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map(size => (
              <button
                key={size}
                type="button"
                aria-pressed={selectedSize === size}
                className={cn(
                  'min-w-11 border px-3 py-2 text-0.875 transition-colors',
                  selectedSize === size
                    ? 'border-volt bg-volt font-bold text-ink'
                    : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                )}
                onClick={() => {
                  setSelectedSize(size);
                  setError(false);
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          variant="volt"
          size="lg"
          className="w-full"
          onClick={() => handleAddToCart(false)}
        >
          ADD TO CART{inCartCount > 0 ? ` (${inCartCount})` : ''}
        </Button>
        <Button
          variant="street-outline"
          size="lg"
          className="w-full"
          onClick={() => handleAddToCart(true)}
        >
          BUY NOW
        </Button>
      </div>
    </div>
  );
};

export default ProductActions;
