'use client';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { SavedDesign } from '@/domain/types';
import { PARTS, MATERIALS } from '@/domain/catalog';
import ProductViewer from '@/components/three/ProductViewer';
export function SharedDesign({
  design,
  token,
}: {
  design: Pick<SavedDesign, 'name' | 'config'>;
  token: string;
}) {
  return (
    <div className="page-shell shared-design">
      <div className="shared-stage">
        <ProductViewer config={design.config} />
      </div>
      <aside>
        <span className="eyebrow">A SHARED PERSPECTIVE</span>
        <h1>{design.name}</h1>
        <p>
          공유된 디자인의 읽기 전용 스냅샷이야.
          <br />내 사본을 만들어 새로운 조합으로 이어가봐.
        </p>
        <div className="configuration-list">
          {PARTS.map(p => (
            <div key={p.id}>
              <span>{p.name}</span>
              <i style={{ background: design.config.colors[p.id] }} />
              <span>{design.config.colors[p.id]}</span>
            </div>
          ))}
          <div>
            <span>재질</span>
            <strong>
              {MATERIALS.find(m => m.id === design.config.material)?.name}
            </strong>
          </div>
          {design.config.engraving && (
            <div>
              <span>각인</span>
              <strong>{design.config.engraving}</strong>
            </div>
          )}
        </div>
        <Link
          className="button"
          href={`/studio/${design.config.model}?source=${token}`}
        >
          내 디자인으로 만들기 <ArrowUpRight size={17} />
        </Link>
      </aside>
    </div>
  );
}
