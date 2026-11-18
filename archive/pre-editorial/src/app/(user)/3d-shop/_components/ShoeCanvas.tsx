'use client';

import { StudioLighting } from '@/types/customizer';
import { ContactShadows, Html, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { useCustomizer } from '../_lib/customizerStore';
import Shoe from './Shoe';

const LoadingHtml = () => (
  <Html center>
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-volt border-t-transparent" />
      <p className="display animate-pulse whitespace-nowrap text-0.875 tracking-widest text-volt">
        LOADING NIJOOW LAB...
      </p>
    </div>
  </Html>
);

const CANVAS_BACKGROUND: Record<StudioLighting, string> = {
  street: 'bg-gradient-to-b from-[#090d16] to-[#030408]',
  studio: 'bg-gradient-to-b from-[#1e293b] to-[#0f172a]',
  sunset: 'bg-gradient-to-b from-[#1c0f2e] to-[#2c1208]',
};

const Lighting = ({ lighting }: { lighting: StudioLighting }) => {
  switch (lighting) {
    case 'street': // 네온 스트릿 — 핫핑크 & 시안
      return (
        <>
          <ambientLight intensity={0.3} color="#dbeafe" />
          <directionalLight position={[6, 3, 2]} intensity={2.0} color="#ff2e88" />
          <directionalLight position={[-6, 3, -2]} intensity={1.5} color="#22d3ee" />
          <spotLight
            position={[0, 10, 0]}
            angle={0.4}
            penumbra={0.5}
            intensity={0.8}
            color="#ffffff"
          />
        </>
      );
    case 'sunset': // 해질녘 골든아워 — 오렌지 & 퍼플
      return (
        <>
          <ambientLight intensity={0.35} color="#fde8d0" />
          <spotLight
            position={[5, 8, 5]}
            angle={0.25}
            penumbra={1}
            intensity={1.6}
            color="#fb923c"
            castShadow
          />
          <directionalLight position={[-5, 4, -5]} intensity={0.8} color="#a78bfa" />
        </>
      );
    case 'studio': // 클린 쇼룸
    default:
      return (
        <>
          <ambientLight intensity={0.65} color="#ffffff" />
          <directionalLight position={[5, 10, 5]} intensity={1.2} color="#ffffff" castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.4} color="#e2e8f0" />
          <spotLight
            position={[0, 8, 2]}
            angle={0.3}
            penumbra={0.8}
            intensity={0.8}
            color="#ffffff"
          />
        </>
      );
  }
};

const SHADOW_OPACITY: Record<StudioLighting, number> = {
  studio: 0.45,
  sunset: 0.65,
  street: 0.8,
};

const ShoeCanvas = () => {
  const lighting = useCustomizer(state => state.lighting);

  return (
    <div
      className={`relative h-full w-full transition-all duration-700 ${CANVAS_BACKGROUND[lighting]}`}
    >
      <Canvas
        camera={{ position: [0, 0.4, 2.4], fov: 45 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <Lighting lighting={lighting} />

        <Suspense fallback={<LoadingHtml />}>
          <Shoe />
          <ContactShadows
            position={[0, -0.61, 0]}
            opacity={SHADOW_OPACITY[lighting]}
            scale={5}
            blur={1.8}
            far={1.5}
            resolution={512}
          />
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={1.3}
          maxDistance={3.8}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>
    </div>
  );
};

export default ShoeCanvas;
