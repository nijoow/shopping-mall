'use client';

import Spinner from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { useProductsByIds } from '@/hooks/useProductsByIds';
import { clearCart, useCart } from '@/lib/savedProducts';
import { cn } from '@/lib/utils';
import { Address, Product } from '@/types/types';
import { commaToCurrency } from '@/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { placeOrder } from '../actions';

const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 3000;

const AddressCard = ({
  address,
  selected,
  onSelect,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      'street-card flex flex-col gap-1 p-4 text-left transition-colors',
      selected ? 'border-volt' : 'hover:border-foreground/40',
    )}
  >
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded-full border',
          selected ? 'border-volt' : 'border-input',
        )}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-volt" />}
      </span>
      <span className="font-bold">{address.name}</span>
      <span className="text-0.75 text-muted-foreground">
        {address.phone_number}
      </span>
    </div>
    <span className="pl-6 text-0.875 text-muted-foreground">
      [{address.post_code}] {address.address}
      {address.detail_address ? `, ${address.detail_address}` : ''}
    </span>
  </button>
);

const CheckoutClient = ({ addresses }: { addresses: Address[] }) => {
  const router = useRouter();
  const { cart, productIds, isHydrated } = useCart();
  const { data: products, isLoading } = useProductsByIds(
    'checkoutProducts',
    productIds,
  );

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    addresses[0]?.address_id ?? null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isHydrated || (isLoading && productIds.length > 0)) {
    return (
      <div className="flex w-full justify-center py-24">
        <Spinner width={32} />
      </div>
    );
  }

  const productMap = new Map((products ?? []).map(p => [p.productId, p]));
  const rows = cart
    .map(item => ({ item, product: productMap.get(item.productId) }))
    .filter((row): row is { item: (typeof cart)[number]; product: Product } =>
      Boolean(row.product),
    );

  if (rows.length === 0) {
    return (
      <div className="street-card flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="display text-1.25 text-muted-foreground">
          YOUR CART IS EMPTY
        </span>
        <Button asChild variant="volt" className="mt-2">
          <Link href="/shop/all">SHOP NOW</Link>
        </Button>
      </div>
    );
  }

  const subtotal = rows.reduce(
    (sum, { item, product }) => sum + product.price * item.quantity,
    0,
  );
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('배송지를 선택해주세요.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const result = await placeOrder({
      addressId: selectedAddressId,
      lines: cart.map(({ productId, quantity, size }) => ({
        productId,
        quantity,
        size,
      })),
    });

    if (result.ok) {
      clearCart();
      router.push(`/orders/${result.orderId}`);
      return;
    }

    setError(result.message);
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="flex w-full min-w-0 flex-col gap-8">
        {/* 배송지 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="display text-1 tracking-widest">SHIPPING TO</h2>
            <Link
              href="/my-page/addresses"
              className="text-0.75 text-muted-foreground transition-colors hover:text-volt"
            >
              + 배송지 관리
            </Link>
          </div>
          {addresses.length === 0 ? (
            <div className="street-card flex flex-col items-center gap-3 px-6 py-10 text-center">
              <span className="text-0.875 text-muted-foreground">
                등록된 배송지가 없어요. 먼저 배송지를 추가해주세요.
              </span>
              <Button asChild variant="volt">
                <Link href="/my-page/addresses">배송지 추가</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {addresses.map(address => (
                <AddressCard
                  key={address.address_id}
                  address={address}
                  selected={selectedAddressId === address.address_id}
                  onSelect={() => setSelectedAddressId(address.address_id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 주문 상품 */}
        <section className="flex flex-col gap-3">
          <h2 className="display text-1 tracking-widest">ORDER ITEMS</h2>
          <ul className="street-card flex flex-col divide-y divide-border px-4">
            {rows.map(({ item, product }) => (
              <li
                key={`${item.productId}-${item.size ?? 'na'}`}
                className="flex items-center gap-4 py-4"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-[#f4f2ec]">
                  <Image
                    src={product.imageUrl}
                    alt={product.productName}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
                <div className="flex min-w-0 flex-auto flex-col">
                  <span className="truncate text-0.875 font-medium">
                    {product.productName}
                  </span>
                  <span className="text-0.75 text-muted-foreground">
                    {item.size ? `SIZE ${item.size} · ` : ''}수량 {item.quantity}
                  </span>
                </div>
                <span className="display text-0.875">
                  ₩{commaToCurrency(product.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 결제 요약 */}
      <aside className="street-card flex w-full shrink-0 flex-col gap-3 p-5 lg:sticky lg:top-20 lg:w-80">
        <h2 className="display text-1 tracking-widest">PAYMENT</h2>
        <div className="flex items-center justify-between text-0.875">
          <span className="text-muted-foreground">상품금액</span>
          <span>₩{commaToCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-0.875">
          <span className="text-muted-foreground">배송비</span>
          <span>
            {shippingFee === 0 ? 'FREE' : `₩${commaToCurrency(shippingFee)}`}
          </span>
        </div>
        <div className="flex items-center justify-between text-0.75 text-volt">
          <span>적립 예정</span>
          <span>+{commaToCurrency(Math.floor(subtotal * 0.01))} P</span>
        </div>
        <div className="my-1 h-px w-full bg-border" />
        <div className="flex items-center justify-between">
          <span className="display text-0.875 tracking-widest">TOTAL</span>
          <span className="display text-1.5">₩{commaToCurrency(total)}</span>
        </div>
        {error && (
          <p role="alert" className="text-0.75 text-destructive">
            {error}
          </p>
        )}
        <Button
          variant="volt"
          size="lg"
          className="mt-1"
          disabled={submitting || addresses.length === 0}
          onClick={handlePlaceOrder}
        >
          {submitting ? (
            <Spinner fill="currentColor" width={20} />
          ) : (
            `₩${commaToCurrency(total)} 결제하기`
          )}
        </Button>
        <p className="text-center text-0.625 text-muted-foreground">
          데모 결제 — 실제 청구는 발생하지 않습니다.
        </p>
      </aside>
    </div>
  );
};

export default CheckoutClient;
