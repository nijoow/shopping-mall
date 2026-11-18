'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Copy, Trash2, Share2 } from 'lucide-react';
import { useState } from 'react';
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
            title="마음에 드는 것을 모아봐."
            text="상품의 하트를 누르면 이곳에 보관돼."
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
  async function copy(design: SavedDesign) {
    try {
      await mutate('design.save', {
        id: crypto.randomUUID(),
        name: `${design.name.slice(0, 32)} 사본`,
        config: design.config,
        version: 0,
        preview: design.preview,
      });
      notify('디자인 사본을 만들었어.');
    } catch (e) {
      notify((e as Error).message);
    }
  }
  async function share(id: string) {
    try {
      const { token } = await mutate<{ token: string }>('design.share', id);
      const url = `${location.origin}/share/${token}`;
      setLink(url);
      try {
        await navigator.clipboard.writeText(url);
        notify('공유 링크를 복사했어.');
      } catch {
        notify('아래 링크를 직접 복사해줘.');
      }
    } catch (e) {
      notify((e as Error).message);
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
        <Link className="button" href="/studio/runner">
          새 디자인 <ArrowUpRight size={18} />
        </Link>
      </div>
      {link && (
        <label className="shared-link-box">
          공유 링크 · 7일간 유효
          <input
            readOnly
            value={link}
            onFocus={e => e.currentTarget.select()}
          />
        </label>
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
                    <button onClick={() => void copy(d)}>
                      <Copy size={14} />
                      복제
                    </button>
                    <button onClick={() => void share(d.id)}>
                      <Share2 size={14} />
                      공유
                    </button>
                    <button onClick={() => setDeleting(d.id)}>
                      <Trash2 size={14} />
                      삭제
                    </button>
                  </div>
                  {deleting === d.id && (
                    <div className="inline-confirm">
                      <p>디자인을 삭제할까? 이미 만든 주문은 유지돼.</p>
                      <button
                        className="button small danger"
                        onClick={async () => {
                          try {
                            await mutate('design.delete', d.id);
                            setDeleting(null);
                          } catch (e) {
                            notify((e as Error).message);
                          }
                        }}
                      >
                        삭제
                      </button>
                      <button
                        className="button small outline"
                        onClick={() => setDeleting(null)}
                      >
                        취소
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="첫 번째 디자인을 만들어봐."
            text="색과 재질, 한 줄의 각인으로 너만의 스니커즈를 완성해."
            href="/studio/runner"
            action="커스텀 시작"
          />
        )}
      </DataGuard>
    </div>
  );
}
