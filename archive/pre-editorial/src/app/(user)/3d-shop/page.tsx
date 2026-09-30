import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Canvas는 반드시 client-only로 로드 (하이드레이션 불일치 방지)
const Customizer = dynamic(() => import('./_components/Customizer'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <p className="display animate-pulse tracking-widest text-muted-foreground">
        LOADING NIJOOW LAB...
      </p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: '3D SHOP — 나만의 스니커즈 커스터마이저',
  description:
    '실시간 3D로 스니커즈 파트별 컬러를 커스텀하고, 시그니처 컬러웨이를 적용하고, 친구에게 공유해 보세요.',
};

export default function ThreeDShopPage() {
  return (
    <Suspense>
      <Customizer />
    </Suspense>
  );
}
