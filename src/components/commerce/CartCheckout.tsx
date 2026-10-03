'use client';
import { SERVICE_COPY } from '@/content/copy';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { ArrowUpRight, Minus, Plus, X, Check } from 'lucide-react';
import {
  FREE_SHIPPING,
  MAX_QUANTITY,
  money,
  SHIPPING_FEE,
  MATERIALS,
} from '@/domain/catalog';
import { ADDRESSES, type CartLine, type DemoOrder } from '@/domain/types';
import { useDemo } from './DemoProvider';
import { DataGuard, EmptyState } from './StateView';

function LineSummary({ line }: { line: CartLine }) {
  return (
    <>
      <Link href={`/product/${line.productId}`} className="cart-photo">
        <Image
          src={line.preview ?? line.product.image}
          alt={line.product.name}
          fill
          unoptimized={!!line.preview}
          sizes="120px"
        />
      </Link>
      <div className="cart-line-details">
        <span className="eyebrow">
          {line.config ? 'PERSONAL EDIT' : line.product.category}
        </span>
        <Link href={`/product/${line.productId}`}>
          <h2>{line.product.name}</h2>
        </Link>
        <p>
          SIZE {line.size}
          {line.config
            ? ` · ${MATERIALS.find(m => m.id === line.config?.material)?.name}`
            : ''}
        </p>
        {line.config && (
          <div className="line-swatches">
            {Object.values(line.config.colors).map((c, i) => (
              <i key={i} style={{ background: c }} />
            ))}
            {line.config.engraving && <span>“{line.config.engraving}”</span>}
          </div>
        )}
        {line.config && (
          <Link
            className="cart-edit-link"
            href={`/studio/${line.config.model}?cart=${line.id}`}
          >
            디자인 수정 ↗
          </Link>
        )}
      </div>
    </>
  );
}
function Totals({
  subtotal,
  children,
}: {
  subtotal: number;
  children: React.ReactNode;
}) {
  const shipping = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
  return (
    <aside className="order-summary">
      <span className="eyebrow">YOUR ORDER</span>
      <h2>A GOOD COMBINATION.</h2>
      <dl>
        <div>
          <dt>상품 금액</dt>
          <dd>{money(subtotal)}</dd>
        </div>
        <div>
          <dt>가상 배송비</dt>
          <dd>{shipping === 0 ? 'FREE' : money(shipping)}</dd>
        </div>
      </dl>
      {shipping > 0 && (
        <p className="shipping-hint">
          {money(FREE_SHIPPING - subtotal)} 추가 시 가상 배송비 무료
        </p>
      )}
      <div className="order-total">
        <span>TOTAL</span>
        <strong>{money(subtotal + shipping)}</strong>
      </div>
      {children}
      <p className="demo-caption">{SERVICE_COPY.demoNotice}</p>
    </aside>
  );
}
export function Cart() {
  const { state, mutate, notify } = useDemo();
  const [excluded, setExcluded] = useState<string[]>([]),
    [busy, setBusy] = useState<string | null>(null);
  const cart = state?.cart ?? [];
  const selected = cart.filter(l => !excluded.includes(l.id)),
    subtotal = selected.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  async function change(op: string, data: unknown, id: string) {
    setBusy(id);
    try {
      await mutate(op, data);
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR SELECTION</span>
          <h1>
            THE BAG<span className="red-dot">.</span>
          </h1>
          <p>서로 다른 취향이 만나는, 나만의 조합.</p>
        </div>
        <span className="eyebrow">{cart.length} EDITS</span>
      </div>
      <DataGuard>
        {cart.length ? (
          <div className="checkout-grid">
            <section>
              <div className="cart-select-all">
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={selected.length === cart.length}
                    onChange={e =>
                      setExcluded(e.target.checked ? [] : cart.map(l => l.id))
                    }
                  />
                  전체 선택
                </label>
                <span>{selected.length}개 구성 선택</span>
              </div>
              <ul className="cart-lines">
                {cart.map(line => (
                  <li key={line.id} className="cart-line">
                    <input
                      aria-label={`${line.product.name} 주문 선택`}
                      type="checkbox"
                      checked={!excluded.includes(line.id)}
                      onChange={e =>
                        setExcluded(old =>
                          e.target.checked
                            ? old.filter(id => id !== line.id)
                            : [...old, line.id],
                        )
                      }
                    />
                    <LineSummary line={line} />
                    <div className="cart-quantity">
                      <button
                        className="icon-button"
                        aria-label={`${line.product.name} 수량 감소`}
                        disabled={line.quantity <= 1 || busy === line.id}
                        onClick={() =>
                          void change(
                            'cart.quantity',
                            { id: line.id, quantity: line.quantity - 1 },
                            line.id,
                          )
                        }
                      >
                        <Minus size={14} />
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        className="icon-button"
                        aria-label={`${line.product.name} 수량 증가`}
                        disabled={
                          line.quantity >= MAX_QUANTITY ||
                          line.quantity >= line.stock ||
                          busy === line.id
                        }
                        onClick={() =>
                          void change(
                            'cart.quantity',
                            { id: line.id, quantity: line.quantity + 1 },
                            line.id,
                          )
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <strong className="cart-line-price">
                      {money(line.unitPrice * line.quantity)}
                    </strong>
                    <button
                      className="icon-button cart-remove"
                      disabled={busy === line.id}
                      aria-label={`${line.product.name} 제거`}
                      onClick={() =>
                        void change('cart.remove', line.id, line.id)
                      }
                    >
                      <X size={17} />
                    </button>
                    {line.stock < line.quantity && (
                      <p className="error-text cart-stock-warning">
                        선택 가능한 수량을 초과했습니다. 수량을 조정해 주세요.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              <Link href="/shop/all" className="text-link cart-continue">
                다른 아이템 둘러보기 <ArrowUpRight size={16} />
              </Link>
            </section>
            {selected.length ? (
              <Totals subtotal={subtotal}>
                <Link
                  className="button"
                  href={`/checkout?items=${selected.map(l => l.id).join(',')}`}
                >
                  선택 상품 주문 <ArrowUpRight size={18} />
                </Link>
              </Totals>
            ) : (
              <div className="notice-box">주문할 상품을 선택해 주세요.</div>
            )}
          </div>
        ) : (
          <EmptyState
            title="장바구니가 비어 있습니다."
            text="상품이나 저장한 디자인을 장바구니에 담아 주세요."
          />
        )}
      </DataGuard>
    </div>
  );
}
export function Checkout() {
  const { state, mutate, refresh } = useDemo(),
    params = useSearchParams(),
    router = useRouter();
  const [address, setAddress] = useState<'studio' | 'home'>('studio'),
    [scenario, setScenario] = useState('success'),
    [pending, setPending] = useState(false),
    [stage, setStage] = useState(''),
    [error, setError] = useState(''),
    [submitted, setSubmitted] = useState<CartLine[] | null>(null);
  const requestKey = useRef<string | null>(null);
  const requested = params.get('items')?.split(',').filter(Boolean);
  const selected = (state?.cart ?? []).filter(
    l => !requested || requested.includes(l.id),
  );
  const lines = pending && submitted ? submitted : selected,
    subtotal = lines.reduce((n, l) => n + l.quantity * l.unitPrice, 0);
  const missing =
    !!requested && requested.some(id => !state?.cart.some(l => l.id === id));
  async function checkout() {
    if (!selected.length) return;
    requestKey.current ??= crypto.randomUUID();
    setSubmitted(selected);
    setPending(true);
    setStage('모의 결제를 처리하는 중입니다.');
    setError('');
    try {
      const order = await mutate<DemoOrder>('checkout', {
        requestKey: requestKey.current,
        lineIds: selected.map(l => l.id),
        addressId: address,
        quotedTotal: subtotal + (subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE),
        scenario,
      });
      if (scenario === 'delayed') {
        setStage('기존 주문 결과를 확인하는 중입니다.');
        await refresh();
      }
      router.push(`/orders/${order.id}`);
    } catch (e) {
      const recovered = await refresh();
      const existing = recovered?.orders.find(
        order => order.requestKey === requestKey.current,
      );
      if (existing) {
        router.push(`/orders/${existing.id}`);
        return;
      }
      setError((e as Error).message);
      setPending(false);
      setStage('');
    }
  }
  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ONE LAST LOOK</span>
          <h1>
            CHECKOUT<span className="red-dot">.</span>
          </h1>
          <p>상품과 옵션을 확인하고 모의 결제를 진행해 주세요.</p>
        </div>
      </div>
      <DataGuard>
        {pending || selected.length ? (
          <div className="checkout-grid">
            <div className="checkout-content">
              {missing && !pending && (
                <div className="notice-box">
                  일부 장바구니 항목이 변경되었습니다.{' '}
                  <Link href="/cart">장바구니에서 다시 확인해 주세요.</Link>
                </div>
              )}
              <section>
                <div className="subheading">
                  <span>01</span>
                  <h2>가상 배송지</h2>
                </div>
                <div className="address-grid">
                  {ADDRESSES.map(a => (
                    <button
                      key={a.id}
                      className={`address-card ${address === a.id ? 'selected' : ''}`}
                      disabled={pending}
                      aria-pressed={address === a.id}
                      onClick={() => setAddress(a.id)}
                    >
                      <span>
                        {a.name}
                        {address === a.id && <Check size={16} />}
                      </span>
                      <p>{a.text}</p>
                    </button>
                  ))}
                </div>
                <p className="option-help">
                  실제 주소나 연락처를 입력하지 않습니다.
                </p>
              </section>
              <section>
                <div className="subheading">
                  <span>02</span>
                  <h2>주문할 아이템</h2>
                </div>
                <ul className="checkout-lines">
                  {lines.map(l => (
                    <li key={l.id}>
                      <LineSummary line={l} />
                      <div className="checkout-line-price">
                        <span>수량 {l.quantity}</span>
                        <strong>{money(l.unitPrice * l.quantity)}</strong>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <div className="subheading">
                  <span>03</span>
                  <h2>모의 결제</h2>
                </div>
                <div className="notice-box">
                  실제 결제와 배송은 진행되지 않습니다. 주문과 디자인은 현재
                  이용 중인 체험 또는 로그인한 계정에 저장됩니다.
                </div>
                <details className="scenario-options">
                  <summary>다른 결제 상황 체험하기</summary>
                  <label>
                    이번 결제의 상황
                    <select
                      value={scenario}
                      disabled={pending}
                      onChange={e => {
                        setScenario(e.target.value);
                      }}
                    >
                      <option value="success">정상 승인</option>
                      <option value="declined">승인 실패 후 재시도</option>
                      <option value="delayed">
                        응답 지연 후 기존 주문 확인
                      </option>
                    </select>
                  </label>
                </details>
              </section>
              {!state?.signedIn && (
                <p className="checkout-login">
                  소셜 로그인하면 체험 중인 디자인과 주문을 계정에 이어서 보관할
                  수 있습니다.
                </p>
              )}
            </div>
            <Totals subtotal={subtotal}>
              {error && (
                <p role="alert" className="error-text">
                  {error}
                </p>
              )}
              {pending && (
                <p role="status" className="payment-stage">
                  {stage}
                </p>
              )}
              <button
                className="button"
                disabled={pending || missing}
                onClick={() => void checkout()}
              >
                {pending
                  ? '주문 처리 중…'
                  : `${money(subtotal + (subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE))} 모의 결제하기`}
                <ArrowUpRight size={17} />
              </button>
            </Totals>
          </div>
        ) : (
          <EmptyState
            title="주문할 상품이 없습니다."
            text="장바구니에서 주문할 상품을 선택해 주세요."
            href="/cart"
            action="장바구니 확인"
          />
        )}
      </DataGuard>
    </div>
  );
}
