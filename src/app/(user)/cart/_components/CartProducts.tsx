'use client';

import Spinner from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { useProductsByIds } from '@/hooks/useProductsByIds';
import { toggleSavedProduct, useSavedProducts } from '@/lib/savedProducts';
import { Product } from '@/types/types';
import { commaToCurrency } from '@/utils';
import Image from 'next/image';
import Link from 'next/link';
import { IoClose } from 'react-icons/io5';

const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 3000;

const CartItem = ({
  product,
  onRemove,
}: {
  product: Product;
  onRemove: () => void;
}) => (
  <li className="flex items-center gap-4 py-4">
    <Link
      href={`/product/${product.productId}`}
      className="relative h-24 w-24 shrink-0 overflow-hidden bg-[#f4f2ec]"
    >
      <Image
        src={product.imageUrl}
        alt={product.productName}
        fill
        sizes="96px"
        className="object-contain"
      />
    </Link>
    <div className="flex min-w-0 flex-auto flex-col gap-0.5">
      <span className="display text-0.625 tracking-widest text-muted-foreground">
        {product.category}
      </span>
      <Link
        href={`/product/${product.productId}`}
        className="truncate font-medium transition-colors hover:text-muted-foreground"
      >
        {product.productName}
      </Link>
      <span className="display text-1">₩{commaToCurrency(product.price)}</span>
    </div>
    <button
      type="button"
      aria-label={`${product.productName} 장바구니에서 제거`}
      className="shrink-0 p-2 text-muted-foreground transition-colors hover:text-foreground"
      onClick={onRemove}
    >
      <IoClose size={20} />
    </button>
  </li>
);

const EmptyCart = () => (
  <div className="street-card flex flex-col items-center gap-3 px-6 py-16 text-center">
    <span className="display text-1.25 text-muted-foreground">
      YOUR CART IS EMPTY
    </span>
    <p className="text-0.875 text-muted-foreground">
      마음에 드는 아이템을 담아보세요.
    </p>
    <Button asChild variant="volt" className="mt-2">
      <Link href="/shop/all">SHOP NOW</Link>
    </Button>
  </div>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-0.875">
    <span className="text-muted-foreground">{label}</span>
    <span>{value}</span>
  </div>
);

const CartProducts = () => {
  const { saved: cart, savedIds, isHydrated } = useSavedProducts('cart');
  const { data: products, isLoading } = useProductsByIds(
    'cartProducts',
    savedIds,
  );

  if (!isHydrated || (isLoading && savedIds.length > 0)) {
    return (
      <div className="flex w-full justify-center py-24">
        <Spinner width={32} />
      </div>
    );
  }

  const cartProducts = (products ?? []).filter(
    ({ productId }) => cart[productId],
  );

  if (cartProducts.length === 0) return <EmptyCart />;

  const subtotal = cartProducts.reduce((sum, { price }) => sum + price, 0);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <ul className="street-card flex w-full flex-col divide-y divide-border px-4">
        {cartProducts.map(product => (
          <CartItem
            key={product.productId}
            product={product}
            onRemove={() => toggleSavedProduct('cart', product.productId)}
          />
        ))}
      </ul>

      <aside className="street-card flex w-full shrink-0 flex-col gap-3 p-5 lg:sticky lg:top-20 lg:w-80">
        <h2 className="display text-1 tracking-widest">ORDER SUMMARY</h2>
        <SummaryRow label="상품금액" value={`₩${commaToCurrency(subtotal)}`} />
        <SummaryRow
          label="배송비"
          value={shippingFee === 0 ? 'FREE' : `₩${commaToCurrency(shippingFee)}`}
        />
        {shippingFee > 0 && (
          <p className="text-0.75 text-muted-foreground">
            ₩{commaToCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} 더 담으면
            무료배송!
          </p>
        )}
        <div className="my-1 h-px w-full bg-border" />
        <div className="flex items-center justify-between">
          <span className="display text-0.875 tracking-widest">TOTAL</span>
          <span className="display text-1.5">
            ₩{commaToCurrency(subtotal + shippingFee)}
          </span>
        </div>
        <Button variant="volt" size="lg" className="mt-1" disabled>
          CHECKOUT
        </Button>
        <p className="text-center text-0.75 text-muted-foreground">
          결제 기능은 준비 중이에요.
        </p>
      </aside>
    </div>
  );
};

export default CartProducts;
