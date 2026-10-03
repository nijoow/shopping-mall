'use client';
import { commerceError, errorMessage, type CommerceError } from './client-api';
import { useRetryDelay } from './useRetryDelay';
import { SERVICE_COPY } from '@/content/copy';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Copy, Trash2, Share2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { PRODUCTS, modelPoster } from '@/domain/catalog';
import { DataGuard, EmptyState } from './StateView';
import { ProductCard } from './ProductCard';
import { useDemo } from './DemoProvider';
import type { SavedDesign } from '@/domain/types';
export function Favorites() {
  const { state } = useDemo();
  const products = PRODUCTS.filter(p => state?.favorites.includes(p.id));
  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">THE PIECES YOU LOVE</span>
          <h1>
            YOUR FAVORITES<span className="red-dot">.</span>
          </h1>
          <p>다음 조합을 위해 골라둔 아이템.</p>
        </div>
      </div>
      <DataGuard>
        {products.length ? (
          <div className="product-grid">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="찜한 상품이 없습니다."
            text="상품의 찜 버튼을 누르면 이곳에서 확인할 수 있습니다."
          />
        )}
      </DataGuard>
    </div>
  );
}
export function Designs() {
  const { state, mutate, notify } = useDemo();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<CommerceError | null>(null);
  const retryDelay = useRetryDelay(failure);
  async function copy(design: SavedDesign) {
    if (busy || retryDelay) return;
    setBusy(true);
    setFailure(null);
    try {
      await mutate('design.save', {
        id: crypto.randomUUID(),
        name: `${design.name.slice(0, 32)} 사본`,
        config: design.config,
        version: 0,
        preview: design.preview,
      });
      notify('디자인 사본을 만들었습니다.');
    } catch (e) {
      setFailure(commerceError(e));
      notify(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function share(id: string) {
    if (busy || retryDelay) return;
    setBusy(true);
    setFailure(null);
    try {
      const { token } = await mutate<{ token: string }>('design.share', id);
      const url = `${location.origin}/share/${token}`;
      setLink(url);
      try {
        await navigator.clipboard.writeText(url);
        notify(SERVICE_COPY.sharedLinkCopied);
      } catch {
        notify(SERVICE_COPY.sharedLinkManual);
      }
    } catch (e) {
      setFailure(commerceError(e));
      notify(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">MADE BY YOU</span>
          <h1>
            YOUR DESIGNS<span className="red-dot">.</span>
          </h1>
          <p>내 취향으로 완성한, 하나뿐인 조합.</p>
        </div>
        <Link className="button" href="/studio/runner" data-confirm-fallback>
          새 디자인 <ArrowUpRight size={18} />
        </Link>
      </div>
      {link && (
        <label className="shared-link-box">
          {SERVICE_COPY.sharedLinkValidity}
          <input
            readOnly
            value={link}
            onFocus={e => e.currentTarget.select()}
          />
        </label>
      )}
      {busy && <p role="status">처리 중…</p>}
      {failure && !deleting && (
        <p className="notice-box" role="alert">
          {errorMessage(failure)}
        </p>
      )}
      <DataGuard>
        {state?.designs.length ? (
          <div className="design-grid">
            {state.designs.map(d => (
              <article key={d.id} className="design-card">
                <Link
                  className="design-image"
                  href={`/studio/${d.config.model}?design=${d.id}`}
                >
                  <Image
                    src={d.preview ?? modelPoster(d.config)}
                    alt={d.name}
                    fill
                    unoptimized={!!d.preview}
                    sizes="33vw"
                  />
                  <span>EDIT ↗</span>
                </Link>
                <div className="design-card-info">
                  <h2>{d.name}</h2>
                  <p>
                    {d.config.model === 'runner'
                      ? 'FORM RUNNER'
                      : 'EVERYDAY LOW'}{' '}
                    · REV. {d.version}
                  </p>
                  <div className="design-swatches">
                    {Object.values(d.config.colors).map((c, i) => (
                      <i key={i} style={{ background: c }} />
                    ))}
                    {d.config.engraving && <span>{d.config.engraving}</span>}
                  </div>
                  <div className="design-card-actions">
                    <button
                      disabled={busy || retryDelay > 0}
                      onClick={() => void copy(d)}
                    >
                      <Copy size={14} />
                      복제
                    </button>
                    <button
                      disabled={busy || retryDelay > 0}
                      onClick={() => void share(d.id)}
                    >
                      <Share2 size={14} />
                      공유
                    </button>
                    <button
                      disabled={busy || retryDelay > 0}
                      aria-haspopup="dialog"
                      onClick={() => {
                        setFailure(null);
                        setDeleting(d.id);
                      }}
                    >
                      <Trash2 size={14} />
                      삭제
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="저장한 디자인이 없습니다."
            text="색상·재질·각인을 선택해 나만의 디자인을 만들어 보세요."
            href="/studio/runner"
            action="디자인 만들기"
          />
        )}
      </DataGuard>
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="디자인 삭제"
        description="디자인을 삭제하시겠습니까? 기존 주문의 디자인은 유지됩니다."
        action="삭제"
        pending={busy}
        error={failure ? errorMessage(failure) : undefined}
        retryDelay={retryDelay}
        onConfirm={() => {
          if (!deleting || busy || retryDelay) return;
          setFailure(null);
          setBusy(true);
          void mutate('design.delete', deleting)
            .then(() => setDeleting(null))
            .catch(e => {
              setFailure(commerceError(e));
              notify(errorMessage(e));
            })
            .finally(() => setBusy(false));
        }}
      />
    </div>
  );
}
