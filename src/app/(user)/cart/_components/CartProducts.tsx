'use client';

import Spinner from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { useProductsByIds } from '@/hooks/useProductsByIds';
import {
  CartItem,
  removeFromCart,
  updateCartQuantity,
  useCart,
} from '@/lib/savedProducts';
import { Product } from '@/types/types';
import { commaToCurrency } from '@/utils';
import Image from 'next/image';
import Link from 'next/link';
import { IoAdd, IoClose, IoRemove } from 'react-icons/io5';

const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 3000;

const QuantityStepper = ({
  item,
}: {
  item: CartItem;
}) => (
  <div className="flex items-center border border-border">
    <button
      type="button"
      aria-label="수량 감소"
      disabled={item.quantity <= 1}
      className="flex h-8 w-8 items-center justify-center transition-colors hover:text-volt disabled:opacity-30"
      onClick={() =>
        updateCartQuantity(item.productId, item.size, item.quantity - 1)
      }
    >
      <IoRemove size={14} />
    </button>
    <span className="display w-8 text-center text-0.875">{item.quantity}</span>
    <button
      type="button"
      aria-label="수량 증가"
      className="flex h-8 w-8 items-center justify-center transition-colors hover:text-volt"
      onClick={() =>
        updateCartQuantity(item.productId, item.size, item.quantity + 1)
      }
    >
      <IoAdd size={14} />
    </button>
  </div>
);

const CartRow = ({ item, product }: { item: CartItem; product: Product }) => (
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
    <div className="flex min-w-0 flex-auto flex-col gap-1">
      <span className="eyebrow text-0.625">{product.category}</span>
      <Link
        href={`/product/${product.productId}`}
        className="truncate font-medium transition-colors hover:text-volt"
      >
        {product.productName}
      </Link>
      {item.size && (
        <span className="text-0.75 text-muted-foreground">
          SIZE · {item.size}
        </span>
      )}
      <div className="mt-1 flex items-center justify-between gap-2">
        <QuantityStepper item={item} />
        <span className="display text-1">
          ₩{commaToCurrency(product.price * item.quantity)}
        </span>
      </div>
    </div>
    <button
      type="button"
      aria-label={`${product.productName} 장바구니에서 제거`}
      className="shrink-0 self-start p-1 text-muted-foreground transition-colors hover:text-foreground"
      onClick={() => removeFromCart(item.productId, item.size)}
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
  const { cart, productIds, isHydrated } = useCart();
  const { data: products, isLoading } = useProductsByIds(
    'cartProducts',
    productIds,
  );

  if (!isHydrated || (isLoading && productIds.length > 0)) {
    return (
      <div className="flex w-full justify-center py-24">
        <Spinner width={32} />
      </div>
    );
  }

  const productMap = new Map((products ?? []).map(p => [p.productId, p]));

  // 상품이 삭제된 라인은 제외
  const rows = cart
    .map(item => ({ item, product: productMap.get(item.productId) }))
    .filter((row): row is { item: CartItem; product: Product } =>
      Boolean(row.product),
    );

  if (rows.length === 0) return <EmptyCart />;

  const subtotal = rows.reduce(
    (sum, { item, product }) => sum + product.price * item.quantity,
    0,
  );
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <ul className="street-card flex w-full flex-col divide-y divide-border px-4">
        {rows.map(({ item, product }) => (
          <CartRow
            key={`${item.productId}-${item.size ?? 'na'}`}
            item={item}
            product={product}
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
        <Button asChild variant="volt" size="lg" className="mt-1">
          <Link href="/checkout">CHECKOUT</Link>
        </Button>
      </aside>
    </div>
  );
};

export default CartProducts;
