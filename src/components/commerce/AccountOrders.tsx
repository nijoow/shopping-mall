'use client';
import { commerceError, errorMessage, type CommerceError } from './client-api';
import { useRetryDelay } from './useRetryDelay';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import { ArrowUpRight, Check, ChevronRight, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { money } from '@/domain/catalog';
import { ADDRESSES, STATUS_LABEL, type OrderStatus } from '@/domain/types';
import ProductViewer from '@/components/three/ProductViewer';
import { useDemo } from './DemoProvider';
import { DataGuard, EmptyState } from './StateView';
import { ConfirmDialog } from './ConfirmDialog';

export function Account() {
  const { state, mutate, notify } = useDemo();
  const [resetting, setResetting] = useState(false),
    [confirmReset, setConfirmReset] = useState(false),
    [resetError, setResetError] = useState<CommerceError | null>(null);
  const resetDelay = useRetryDelay(resetError);
  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR PERSONAL SPACE</span>
          <h1>
            MY NIJOOW<span className="red-dot">.</span>
          </h1>
          <p>{state?.name ?? '게스트'}, 나만의 관점으로 채워가는 컬렉션.</p>
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
            게스트로 체험 중입니다. 소셜 로그인하면 디자인과 주문을 계정에
            이어서 보관할 수 있습니다.
          </p>
        )}
        <section id="my-orders" className="account-orders">
          <div className="section-heading">
            <h2>
              YOUR ORDERS<span>.</span>
            </h2>
            <span className="eyebrow">모의 결제 주문</span>
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
              title="주문 내역이 없습니다."
              text="디자인을 만들고 주문 과정을 체험해 보세요."
              href="/studio/runner"
              action="디자인 만들기"
            />
          )}
        </section>
        <section className="account-addresses">
          <span className="eyebrow">DEMO ADDRESSES</span>
          <h2>체험용 배송지</h2>
          <div className="address-grid">
            {ADDRESSES.map(a => (
              <div className="address-card" key={a.id}>
                <strong>{a.name}</strong>
                <p>{a.text}</p>
              </div>
            ))}
          </div>
          <p className="option-help">
            개인정보를 입력하지 않고 미리 준비된 가상 주소를 선택할 수 있습니다.
          </p>
        </section>
        <section className="account-reset">
          <h2>체험 데이터 초기화</h2>
          <p>
            주문·장바구니·체험용 재고를 초기화합니다. 저장한 디자인과 찜은
            유지됩니다.
          </p>
          <button
            className="text-link"
            aria-haspopup="dialog"
            onClick={() => {
              setResetError(null);
              setConfirmReset(true);
            }}
          >
            체험 데이터 초기화
          </button>
          <ConfirmDialog
            open={confirmReset}
            onClose={() => setConfirmReset(false)}
            title="체험 데이터 초기화"
            description="현재 이용 중인 체험의 주문·장바구니·체험용 재고를 초기화하시겠습니까? 저장한 디자인과 찜은 유지됩니다."
            action="초기화"
            pending={resetting}
            error={resetError ? errorMessage(resetError) : undefined}
            retryDelay={resetDelay}
            onConfirm={() => {
              if (resetting || resetDelay) return;
              setResetError(null);
              setResetting(true);
              void mutate('orders.reset', 'CONFIRM_RESET')
                .then(() => {
                  setConfirmReset(false);
                  notify('주문·장바구니·체험용 재고를 초기화했습니다.');
                })
                .catch(e => {
                  setResetError(commerceError(e));
                  notify(errorMessage(e));
                })
                .finally(() => setResetting(false));
            }}
          />
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
    [failure, setFailure] = useState<CommerceError | null>(null),
    [confirm, setConfirm] = useState<OrderStatus | null>(null),
    [preview, setPreview] = useState<number | null>(null);
  const retryDelay = useRetryDelay(failure);
  const previewOpener = useRef<HTMLButtonElement | null>(null);
  async function advance(status: OrderStatus) {
    if (pending || retryDelay) return;
    setPending(true);
    setError('');
    setFailure(null);
    try {
      await mutate('order.advance', { id, status });
      setConfirm(null);
    } catch (e) {
      setFailure(commerceError(e));
      setError(errorMessage(e));
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
                  {STATUS_LABEL[order.status]} · 모의 결제 주문이며 실제 배송은
                  진행되지 않습니다.
                </p>
              </div>
              <Link href="/my-page" className="text-link" data-confirm-fallback>
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
                              onClick={event => {
                                previewOpener.current = event.currentTarget;
                                setPreview(i);
                              }}
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
                  <p>
                    다음 단계로 진행하며 배송·취소·반품 과정을 체험할 수
                    있습니다.
                  </p>
                  {transitions[order.status] && (
                    <button
                      className="button"
                      disabled={pending || retryDelay > 0}
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
                      disabled={pending || retryDelay > 0}
                      aria-haspopup="dialog"
                      onClick={() => {
                        setError('');
                        setConfirm('CANCELLED');
                      }}
                    >
                      주문 취소
                    </button>
                  )}
                  {order.status === 'DELIVERED' && (
                    <button
                      className="button outline"
                      disabled={pending || retryDelay > 0}
                      aria-haspopup="dialog"
                      onClick={() => {
                        setError('');
                        setConfirm('RETURN_REQUESTED');
                      }}
                    >
                      전체 주문 반품 신청
                    </button>
                  )}
                  <ConfirmDialog
                    open={confirm !== null}
                    onClose={() => setConfirm(null)}
                    title={
                      confirm === 'CANCELLED'
                        ? '주문 취소 · 모의 환불'
                        : '전체 주문 반품'
                    }
                    description={
                      confirm === 'CANCELLED'
                        ? '주문을 취소하고 모의 환불을 진행하시겠습니까? 체험용 재고가 복구됩니다.'
                        : '이 주문의 모든 상품에 대해 반품을 신청하시겠습니까?'
                    }
                    action="확인"
                    pending={pending}
                    error={error || undefined}
                    retryDelay={retryDelay}
                    onConfirm={() => {
                      if (confirm) void advance(confirm);
                    }}
                  />
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
                <Dialog.Content
                  className="order-preview-dialog"
                  onCloseAutoFocus={event => {
                    event.preventDefault();
                    previewOpener.current?.focus();
                  }}
                >
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
                    디자인을 수정해도 주문 당시 저장된 구성은 유지됩니다.
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
            title="주문을 조회할 수 없습니다."
            text="현재 이용 중인 체험 또는 로그인한 계정의 주문만 조회할 수 있습니다."
            href="/my-page"
            action="주문 내역 확인"
          />
        )}
      </DataGuard>
    </div>
  );
}
