'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { customizerActions } from '../_lib/customizerStore';
import { decodeShareCode } from '../_lib/shareCode';
import ControlPanel from './ControlPanel';
import ShoeCanvas from './ShoeCanvas';

/**
 * 3D 뷰포트 + 컨트롤 패널 레이아웃.
 * ?code= 공유 코드가 있으면 최초 1회 스토어에 복원한다.
 */
const Customizer = () => {
  const searchParams = useSearchParams();
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const code = searchParams.get('code');
    if (!code) return;

    const decoded = decodeShareCode(code);
    if (!decoded) return;

    customizerActions.hydrate({
      ...(decoded.preset ? { preset: decoded.preset } : { preset: null }),
      ...(decoded.tagNumber !== undefined && { tagNumber: decoded.tagNumber }),
      ...(decoded.lighting && { lighting: decoded.lighting }),
    });
    if (decoded.config) {
      Object.entries(decoded.config).forEach(([part, color]) => {
        if (color) {
          customizerActions.setPartColor(
            part as keyof typeof decoded.config,
            color,
          );
        }
      });
      // setPartColor가 preset을 해제하므로 공유 코드의 preset을 다시 반영
      if (decoded.preset) {
        customizerActions.hydrate({ preset: decoded.preset });
      }
    }
  }, [searchParams]);

  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] w-full grid-rows-[55dvh_auto] lg:grid-cols-[1fr_420px] lg:grid-rows-1">
      <section className="relative h-full min-h-[320px] w-full">
        <ShoeCanvas />
        <div className="pointer-events-none absolute left-4 top-4 flex flex-col">
          <span className="display text-1.75 leading-none text-white sm:text-2.5">
            NIJOOW <span className="text-volt">3D</span> SHOP
          </span>
          <span className="mt-1 text-0.875 text-white/60">
            파트를 클릭해서 나만의 컬러웨이를 완성하세요
          </span>
        </div>
      </section>
      <aside className="border-t border-border bg-background lg:border-l lg:border-t-0">
        <ControlPanel />
      </aside>
    </div>
  );
};

export default Customizer;
