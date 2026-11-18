'use client';

import { cn } from '@/lib/utils';
import { StreetPreset, StudioLighting } from '@/types/customizer';
import { Camera, Check, RotateCcw, Share2 } from 'lucide-react';
import { useState } from 'react';
import {
  COLOR_PALETTE,
  PART_LABELS,
  SHOE_PARTS,
  STREET_PRESETS,
  customizerActions,
  customizerStore,
  useCustomizer,
} from '../_lib/customizerStore';
import { encodeShareCode } from '../_lib/shareCode';

const LIGHTING_OPTIONS: { value: StudioLighting; label: string }[] = [
  { value: 'street', label: 'STREET' },
  { value: 'studio', label: 'STUDIO' },
  { value: 'sunset', label: 'SUNSET' },
];

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="display text-0.75 tracking-[0.2em] text-muted-foreground">
    {children}
  </h3>
);

const ControlPanel = () => {
  const config = useCustomizer(state => state.config);
  const currentPart = useCustomizer(state => state.currentPart);
  const preset = useCustomizer(state => state.preset);
  const tagNumber = useCustomizer(state => state.tagNumber);
  const lighting = useCustomizer(state => state.lighting);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const state = customizerStore.getState();
    const code = encodeShareCode({
      preset: state.preset,
      tagNumber: state.tagNumber,
      lighting: state.lighting,
      config: state.config,
    });
    const url = `${window.location.origin}/3d-shop?code=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard 권한이 없으면 prompt로 대체
      window.prompt('아래 URL을 복사하세요', url);
    }
  };

  const handleSnapshot = () => {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `nijoow-custom-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-5">
      {/* 시그니처 프리셋 */}
      <section className="flex flex-col gap-3">
        <SectionTitle>SIGNATURE COLORWAY</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(STREET_PRESETS) as StreetPreset[]).map(key => {
            const data = STREET_PRESETS[key];
            const active = preset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => customizerActions.setPreset(key)}
                className={cn(
                  'street-card flex flex-col items-start gap-1 p-3 text-left',
                  active ? 'border-volt shadow-street-sm' : 'street-card-hover',
                )}
              >
                <span
                  className="h-2 w-8"
                  style={{ backgroundColor: data.themeColor }}
                />
                <span className="display text-0.875">{data.name}</span>
                <span className="text-0.75 leading-tight text-muted-foreground">
                  {data.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 파트 선택 */}
      <section className="flex flex-col gap-3">
        <SectionTitle>PART</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {SHOE_PARTS.map(part => (
            <button
              key={part}
              type="button"
              onClick={() => customizerActions.setCurrentPart(part)}
              className={cn(
                'border px-3 py-1.5 text-0.875 transition-all',
                currentPart === part
                  ? 'border-volt bg-volt text-ink'
                  : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
              )}
            >
              {PART_LABELS[part]}
            </button>
          ))}
        </div>
      </section>

      {/* 컬러 팔레트 */}
      <section className="flex flex-col gap-3">
        <SectionTitle>
          COLOR — <span className="text-volt">{PART_LABELS[currentPart]}</span>
        </SectionTitle>
        <div className="grid grid-cols-6 gap-2">
          {COLOR_PALETTE.map(color => {
            const active =
              config[currentPart].toLowerCase() === color.toLowerCase();
            return (
              <button
                key={color}
                type="button"
                aria-label={color}
                onClick={() => customizerActions.setPartColor(currentPart, color)}
                className={cn(
                  'relative aspect-square border transition-transform',
                  active
                    ? 'scale-110 border-volt'
                    : 'border-input hover:scale-105',
                )}
                style={{ backgroundColor: color }}
              >
                {active && (
                  <Check
                    size={14}
                    className="absolute inset-0 m-auto text-white mix-blend-difference"
                  />
                )}
              </button>
            );
          })}
          {/* 자유 색상 피커 */}
          <label
            className="relative aspect-square cursor-pointer border border-dashed border-input bg-[conic-gradient(#ff2e88,#d7ff00,#22d3ee,#7c3aed,#ff2e88)]"
            aria-label="커스텀 색상 선택"
          >
            <input
              type="color"
              value={config[currentPart]}
              onChange={e =>
                customizerActions.setPartColor(currentPart, e.target.value)
              }
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
        </div>
      </section>

      {/* 커스텀 태그 넘버 */}
      <section className="flex flex-col gap-3">
        <SectionTitle>HEEL TAG NUMBER</SectionTitle>
        <input
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={tagNumber}
          onChange={e =>
            customizerActions.setTagNumber(e.target.value.replace(/[^0-9]/g, ''))
          }
          placeholder="00"
          className="input-field display w-24 text-center text-1.25 tracking-widest"
          aria-label="힐 태그 넘버 (숫자 2자리)"
        />
      </section>

      {/* 조명 무드 */}
      <section className="flex flex-col gap-3">
        <SectionTitle>LIGHTING MOOD</SectionTitle>
        <div className="grid grid-cols-3 gap-1.5">
          {LIGHTING_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => customizerActions.setLighting(value)}
              className={cn(
                'display border py-2 text-0.75 tracking-widest transition-all',
                lighting === value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* 액션 */}
      <section className="mt-auto flex gap-2 pt-2">
        <button
          type="button"
          onClick={handleSnapshot}
          className="street-card street-card-hover flex flex-1 items-center justify-center gap-2 py-3 text-0.875 font-bold"
        >
          <Camera size={16} /> 스냅샷
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-2 bg-volt py-3 text-0.875 font-bold text-ink transition-all hover:-translate-y-0.5 hover:shadow-street-fg"
        >
          {copied ? <Check size={16} /> : <Share2 size={16} />}
          {copied ? '복사됨!' : '공유하기'}
        </button>
        <button
          type="button"
          onClick={customizerActions.reset}
          aria-label="초기화"
          className="street-card street-card-hover flex items-center justify-center px-4"
        >
          <RotateCcw size={16} />
        </button>
      </section>
    </div>
  );
};

export default ControlPanel;
