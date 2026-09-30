'use client';

import Spinner from '@/components/Spinner';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';

// three.js 번들은 3D 모드를 열 때만 로드한다
const Product3DViewer = dynamic(() => import('@/components/Product3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0a0a10]">
      <Spinner width={32} />
    </div>
  ),
});

type MediaMode = 'photo' | '3d';

const ProductMedia = ({
  imageUrl,
  productName,
  colors,
  has3DPreview,
}: {
  imageUrl: string;
  productName: string;
  colors: string[];
  has3DPreview: boolean;
}) => {
  const [mode, setMode] = useState<MediaMode>('photo');

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="street-card relative aspect-square w-full overflow-hidden">
        {mode === 'photo' ? (
          <div className="relative h-full w-full bg-[#f4f2ec]">
            <Image
              src={imageUrl}
              alt={productName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain"
            />
          </div>
        ) : (
          <Product3DViewer colors={colors} />
        )}

        {mode === '3d' && (
          <span className="eyebrow pointer-events-none absolute bottom-3 right-3 z-10 text-0.625">
            DRAG TO ROTATE
          </span>
        )}
      </div>

      {has3DPreview && (
        <div className="flex gap-1.5">
          {(
            [
              { value: 'photo', label: 'PHOTO' },
              { value: '3d', label: '3D VIEW' },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              className={cn(
                'display border px-3.5 py-1.5 text-0.625 tracking-widest transition-colors',
                mode === value
                  ? 'border-volt bg-volt text-ink'
                  : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
              )}
              onClick={() => setMode(value)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductMedia;
