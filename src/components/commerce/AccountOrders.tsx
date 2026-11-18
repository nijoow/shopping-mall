'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { ArrowUpRight, Check, ChevronRight, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { money } from '@/domain/catalog';
import { ADDRESSES, STATUS_LABEL, type OrderStatus } from '@/domain/types';
import ProductViewer from '@/components/three/ProductViewer';
import { useDemo } from './DemoProvider';
import { DataGuard, EmptyState } from './StateView';

export function Login({
  callbackUrl,
  errorCode,
}: {
  callbackUrl: string;
  errorCode?: string;
}) {
  const [pending, setPending] = useState(''),
    [error, setError] = useState(
      errorCode
        ? '소셜 로그인을 완료하지 못했어. 다시 시도하거나 데모로 계속할 수 있어.'
        : '',
    );
  return (
    <div className="login-page">
      <section className="login-intro">
        <span className="eyebrow">YOUR EDIT, EVERYWHERE.</span>
        <h1>
          KEEP
          <br />
          YOUR
          <br />
          PERSPECTIVE<span>.</span>
        </h1>
        <p>
          내가 만든 디자인, 골라둔 아이템,
          <br />
          주문한 스니커즈까지 한곳에.
        </p>
      </section>
      <section className="login-panel">
        <span className="eyebrow">WELCOME TO NIJOOW</span>
        <h2>취향을 이어서 보관해봐.</h2>
        <p>
          로그인하면 지금 체험 중인 디자인·찜·장바구니·데모 주문이 계정에 함께
          보관돼.
        </p>
        <div className="social-buttons">
          {[
            { id: 'kakao', label: '카카오로 계속하기', icon: 'K' },
            { id: 'naver', label: '네이버로 계속하기', icon: 'N' },
            { id: 'google', label: 'Google로 계속하기', icon: 'G' },
          ].map(provider => (
            <button
              key={provider.id}
              className={`social-button ${provider.id}`}
              disabled={!!pending}
              onClick={async () => {
                setPending(provider.id);
                setError('');
                try {
                  await signIn(provider.id, { redirectTo: callbackUrl });
                } catch {
                  setError('로그인 연결을 시작하지 못했어. 다시 시도해줘.');
                  setPending('');
                }
              }}
            >
              <span>{provider.icon}</span>
              {pending === provider.id ? '연결하고 있어…' : provider.label}
              <ArrowUpRight size={17} />
            </button>
          ))}
        </div>
        {error && (
          <p role="alert" className="error-text">
            {error}
          </p>
        )}
        <Link href={callbackUrl} className="button outline">
          로그인 없이 계속 체험하기
        </Link>
        <p className="demo-caption">
          이메일 자동 계정 병합을 사용하지 않아.
          <br />
          결제와 배송은 로그인 후에도 데모로 진행돼.
        </p>
      </section>
    </div>
  );
}
export function Account() {
  const { state, mutate, notify } = useDemo();
  const [resetting, setResetting] = useState(false),
    [confirmReset, setConfirmReset] = useState(false);
  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR PERSONAL SPACE</span>
          <h1>
            MY NIJOOW<span className="red-dot">.</span>
          </h1>
          <p>{state?.name ?? '나의 공간'}, 나만의 관점으로 채워가는 컬렉션.</p>
        </div>
        {state?.signedIn ? (
          <button
            className="text-link"
            onClick={() => void signOut({ redirectTo: '/' })}
          >
            로그아웃
          </button>
        ) : (
          <Link className="button" href="/auth/login?callbackUrl=/my-page">
            소셜 로그인 <ArrowUpRight size={17} />
          </Link>
        )}
      </div>
      <DataGuard>
        <div className="account-stats">
          <Link href="/designs">
            <span>MY DESIGNS</span>
            <strong>{state?.designs.length ?? 0}</strong>
            <ArrowUpRight />
          </Link>
          <Link href="/like">
            <span>FAVORITES</span>
            <strong>{state?.favorites.length ?? 0}</strong>
            <ArrowUpRight />
          </Link>
          <a href="#my-orders">
            <span>DEMO ORDERS</span>
            <strong>{state?.orders.length ?? 0}</strong>
            <ArrowUpRight />
          </a>
        </div>
        {!state?.signedIn && (
          <p className="notice-box">
            지금은 나만의 게스트 체험 공간이야. 소셜 로그인하면 만든 디자인과
            데모 주문을 기존 계정 데이터와 함께 보관할 수 있어.
          </p>
        )}
        <section id="my-orders" className="account-orders">
          <div className="section-heading">
            <h2>
              YOUR ORDERS<span>.</span>
            </h2>
            <span className="eyebrow">실제 청구 없는 데모 주문</span>
          </div>
          {state?.orders.length ? (
            <div className="order-list">
              {state.orders.map(order => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="order-list-image">
                    <Image
                      src={order.items[0].preview ?? order.items[0].image}
                      alt={order.items[0].name}
                      fill
                      unoptimized={!!order.items[0].preview}
                      sizes="100px"
                    />
                  </div>
                  <div>
                    <span className="eyebrow">
                      {order.number} ·{' '}
                      {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                    <h3>
                      {order.items[0].name}
                      {order.items.length > 1
                        ? ` 외 ${order.items.length - 1}개 구성`
                        : ''}
                    </h3>
                    <span className="status-label">
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <strong>{money(order.total)}</strong>
                  <ChevronRight size={20} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="첫 번째 주문을 기다리고 있어."
              text="나만의 스니커즈를 만들고 주문까지 체험해봐."
              href="/studio/runner"
              action="커스텀 시작"
            />
          )}
        </section>
        <section className="account-addresses">
          <span className="eyebrow">DEMO ADDRESSES</span>
          <h2>배송지까지 가볍게 체험해.</h2>
          <div className="address-grid">
            {ADDRESSES.map(a => (
              <div className="address-card" key={a.id}>
                <strong>{a.name}</strong>
                <p>{a.text}</p>
              </div>
            ))}
          </div>
          <p className="option-help">
            개인정보 입력 없이 미리 준비된 가상 주소로 주문할 수 있어.
          </p>
        </section>
        <section className="account-reset">
          <h2>데모 주문부터 다시 시작할까?</h2>
          <p>
            주문·장바구니·가상 재고만 초기화돼. 저장한 디자인과 찜은 유지돼.
          </p>
          {confirmReset ? (
            <div className="inline-confirm">
              <p>현재 체험 공간의 주문과 장바구니를 초기화할까?</p>
              <button
                className="button small danger"
                disabled={resetting}
                onClick={async () => {
                  setResetting(true);
                  try {
                    await mutate('orders.reset', 'CONFIRM_RESET');
                    setConfirmReset(false);
                    notify('주문과 장바구니를 초기화했어.');
                  } catch (e) {
                    notify((e as Error).message);
                  } finally {
                    setResetting(false);
                  }
                }}
              >
                초기화
              </button>
              <button
                className="button small outline"
                onClick={() => setConfirmReset(false)}
              >
                취소
              </button>
            </div>
          ) : (
            <button className="text-link" onClick={() => setConfirmReset(true)}>
              데모 주문·장바구니 초기화
            </button>
          )}
        </section>
      </DataGuard>
    </div>
  );
}
const transitions: Partial<
  Record<OrderStatus, { next: OrderStatus; label: string }>
> = {
  CONFIRMED: { next: 'PREPARING', label: '출고 준비로 진행' },
  PREPARING: { next: 'SHIPPED', label: '배송 중으로 진행' },
  SHIPPED: { next: 'DELIVERED', label: '배송 완료로 진행' },
  RETURN_REQUESTED: { next: 'REFUNDED', label: '회수 완료 · 모의 환불' },
};
export function OrderDetails({ id }: { id: string }) {
  const { state, mutate } = useDemo();
  const order = state?.orders.find(o => o.id === id);
  const [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    [confirm, setConfirm] = useState<OrderStatus | null>(null),
    [preview, setPreview] = useState<number | null>(null);
  async function advance(status: OrderStatus) {
    setPending(true);
    setError('');
    try {
      await mutate('order.advance', { id, status });
      setConfirm(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="page-shell">
      <DataGuard>
        {order ? (
          <>
            <div className="page-heading">
              <div>
                <span className="eyebrow">{order.number} · DEMO ORDER</span>
                <h1>
                  {order.status === 'CANCELLED' || order.status === 'REFUNDED'
                    ? 'ORDER REFUNDED'
                    : 'YOUR DESIGN, ORDERED'}
                  <span className="red-dot">.</span>
                </h1>
                <p>
                  {STATUS_LABEL[order.status]} · 실제 청구와 배송은 발생하지
                  않아.
                </p>
              </div>
              <Link href="/my-page" className="text-link">
                주문 목록 <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="order-progress">
              {(
                [
                  'CONFIRMED',
                  'PREPARING',
                  'SHIPPED',
                  'DELIVERED',
                ] as OrderStatus[]
              ).map((s, i) => (
                <div
                  key={s}
                  className={
                    order.events.some(e => e.status === s) ? 'reached' : ''
                  }
                >
                  <span>
                    {order.events.some(e => e.status === s) ? (
                      <Check size={14} />
                    ) : (
                      String(i + 1).padStart(2, '0')
                    )}
                  </span>
                  {STATUS_LABEL[s]}
                </div>
              ))}
            </div>
            <div className="checkout-grid">
              <div>
                <ul className="order-detail-lines">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      <div className="order-detail-image">
                        <Image
                          src={item.preview ?? item.image}
                          alt={item.name}
                          fill
                          unoptimized={!!item.preview}
                          sizes="160px"
                        />
                      </div>
                      <div>
                        <span className="eyebrow">
                          {item.config
                            ? 'YOUR PERSONAL EDIT'
                            : 'NIJOOW COLLECTION'}
                        </span>
                        <h2>{item.name}</h2>
                        <p>
                          SIZE {item.size} · 수량 {item.quantity}
                        </p>
                        {item.config && (
                          <>
                            <div className="line-swatches">
                              {Object.values(item.config.colors).map((c, j) => (
                                <i key={j} style={{ background: c }} />
                              ))}
                              <span>
                                {item.config.engraving
                                  ? `“${item.config.engraving}”`
                                  : ''}
                              </span>
                            </div>
                            <button
                              className="text-link"
                              onClick={() => setPreview(i)}
                            >
                              주문한 3D 다시 보기 <ArrowUpRight size={15} />
                            </button>
                          </>
                        )}
                      </div>
                      <strong>{money(item.unitPrice * item.quantity)}</strong>
                    </li>
                  ))}
                </ul>
                <section className="shipping-details">
                  <span className="eyebrow">SHIPPING TO</span>
                  <h2>가상 배송지</h2>
                  <p>{order.address}</p>
                </section>
                <details className="order-history">
                  <summary>처리 기록 확인</summary>
                  {order.events.map((event, i) => (
                    <p key={i}>
                      <span>{STATUS_LABEL[event.status]}</span>
                      <time>{new Date(event.at).toLocaleString('ko-KR')}</time>
                    </p>
                  ))}
                </details>
              </div>
              <aside className="order-summary">
                <span className="eyebrow">ORDER SUMMARY</span>
                <dl>
                  <div>
                    <dt>상품 금액</dt>
                    <dd>{money(order.subtotal)}</dd>
                  </div>
                  <div>
                    <dt>가상 배송비</dt>
                    <dd>{order.shipping ? money(order.shipping) : 'FREE'}</dd>
                  </div>
                </dl>
                <div className="order-total">
                  <span>TOTAL</span>
                  <strong>{money(order.total)}</strong>
                </div>
                <span className="status-label">
                  {STATUS_LABEL[order.status]}
                </span>
                <div className="order-simulation">
                  <span className="eyebrow">배송 진행 체험</span>
                  <p>다음 단계로 직접 진행하며 주문 후 흐름을 확인해봐.</p>
                  {transitions[order.status] && (
                    <button
                      className="button"
                      disabled={pending}
                      onClick={() =>
                        void advance(transitions[order.status]!.next)
                      }
                    >
                      {transitions[order.status]!.label}
                      <ArrowUpRight size={16} />
                    </button>
                  )}
                  {['CONFIRMED', 'PREPARING'].includes(order.status) && (
                    <button
                      className="button outline"
                      disabled={pending}
                      onClick={() => setConfirm('CANCELLED')}
                    >
                      주문 취소
                    </button>
                  )}
                  {order.status === 'DELIVERED' && (
                    <button
                      className="button outline"
                      disabled={pending}
                      onClick={() => setConfirm('RETURN_REQUESTED')}
                    >
                      전체 주문 반품 신청
                    </button>
                  )}
                  {confirm && (
                    <div className="inline-confirm">
                      <p>
                        {confirm === 'CANCELLED'
                          ? '주문을 취소하고 가상 재고를 복구할까?'
                          : '이 주문 전체의 반품을 신청할까?'}
                      </p>
                      <button
                        className="button small danger"
                        disabled={pending}
                        onClick={() => void advance(confirm)}
                      >
                        확인
                      </button>
                      <button
                        className="button small outline"
                        onClick={() => setConfirm(null)}
                      >
                        돌아가기
                      </button>
                    </div>
                  )}
                  {error && (
                    <p role="alert" className="error-text">
                      {error}
                    </p>
                  )}
                </div>
              </aside>
            </div>
            <Dialog.Root
              open={preview !== null}
              onOpenChange={open => {
                if (!open) setPreview(null);
              }}
            >
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="order-preview-dialog">
                  <div className="dialog-top">
                    <Dialog.Title>주문 당시의 디자인</Dialog.Title>
                    <Dialog.Close
                      className="icon-button"
                      aria-label="3D 미리보기 닫기"
                    >
                      <X />
                    </Dialog.Close>
                  </div>
                  <Dialog.Description>
                    수정 이후에도 주문에 저장된 구성이 그대로 유지돼.
                  </Dialog.Description>
                  {preview !== null && order.items[preview]?.config && (
                    <ProductViewer config={order.items[preview].config!} />
                  )}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </>
        ) : (
          <EmptyState
            title="이 주문을 열 수 없어."
            text="현재 체험 공간이나 로그인한 계정에 속한 주문만 확인할 수 있어."
            href="/my-page"
            action="나의 주문 확인"
          />
        )}
      </DataGuard>
    </div>
  );
}
