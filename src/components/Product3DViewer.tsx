'use client';

import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';

interface Props {
  modelUrl?: string;
}

const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

export const Product3DViewer = ({ modelUrl }: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[400px] w-full rounded-xl bg-gray-100/50 shadow-inner flex items-center justify-center">
        <p className="text-gray-400">Loading 3D Viewer...</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-xl bg-gray-100/50 shadow-inner">
      <Canvas shadows camera={{ position: [0, 0, 4], fov: 35 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5}>
            {modelUrl ? (
              <Model url={modelUrl} />
            ) : (
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="gray" />
              </mesh>
            )}
          </Stage>
        </Suspense>
        <OrbitControls makeDefault autoRotate />
      </Canvas>
    </div>
  );
};

export default Product3DViewer;
