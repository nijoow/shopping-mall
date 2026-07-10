'use client';

import {
  DRACO_DECODER_PATH,
  GROUPED_MESHES,
  MODEL_PATH,
  ROOT_MESHES,
} from '@/lib/shoeModel';
import { ShoeConfig, ShoePart } from '@/types/customizer';
import { Center, ContactShadows, Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';

/**
 * 상품 상세용 읽기 전용 3D 뷰어.
 * 상품의 컬러웨이를 shoe.glb 파트에 입혀 자동 회전으로 보여준다.
 * (파트별 편집은 /3d-shop 커스텀 랩의 몫)
 */

const LoadingHtml = () => (
  <Html center>
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-volt border-t-transparent" />
      <p className="display animate-pulse whitespace-nowrap text-0.75 tracking-widest text-volt">
        LOADING 3D...
      </p>
    </div>
  </Html>
);

/** 상품 colors(1~3개 hex)를 신발 파트 컬러웨이로 근사 매핑 */
const buildShoeConfig = (colors: string[]): ShoeConfig => {
  const [primary = '#16161a', secondary = '#d7ff00', tertiary] = colors;

  return {
    main: primary,
    upper: primary,
    sideDesign: secondary,
    heelSupport: secondary,
    laces: tertiary ?? secondary,
    midSole: '#f4f2ec',
    bottomSole: tertiary ?? primary,
  };
};

const StaticShoe = ({ config }: { config: ShoeConfig }) => {
  const { nodes } = useGLTF(MODEL_PATH, DRACO_DECODER_PATH) as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };

  const renderPartMesh = (name: string, part: ShoePart) => {
    const node = nodes[name];
    if (!node) return null;

    return (
      <mesh
        key={name}
        geometry={node.geometry}
        position={node.position}
        quaternion={node.quaternion}
        scale={node.scale}
      >
        <meshStandardMaterial
          color={new THREE.Color(config[part])}
          roughness={0.55}
          metalness={part === 'sideDesign' || part === 'midSole' ? 0.25 : 0.05}
        />
      </mesh>
    );
  };

  return (
    <Center position={[0, -0.15, 0]}>
      <group dispose={null} scale={0.72} rotation={[0, Math.PI / 2 + 0.4, 0]}>
        {GROUPED_MESHES.map(({ group, meshes }) => {
          const groupNode = nodes[group];
          if (!groupNode) return null;

          return (
            <group
              key={group}
              position={groupNode.position}
              quaternion={groupNode.quaternion}
              scale={groupNode.scale}
            >
              {Object.entries(meshes).map(([name, part]) =>
                renderPartMesh(name, part),
              )}
            </group>
          );
        })}

        {Object.entries(ROOT_MESHES).map(([name, part]) =>
          renderPartMesh(name, part),
        )}
      </group>
    </Center>
  );
};

const Product3DViewer = ({ colors }: { colors: string[] }) => {
  const config = useMemo(() => buildShoeConfig(colors), [colors]);

  return (
    <div className="h-full w-full bg-gradient-to-b from-[#101018] to-[#050508]">
      <Canvas camera={{ position: [0, 0.4, 2.3], fov: 45 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.5} color="#e8ecff" />
        <directionalLight position={[6, 4, 2]} intensity={1.6} color="#ffffff" />
        <directionalLight position={[-6, 3, -2]} intensity={0.7} color="#22d3ee" />

        <Suspense fallback={<LoadingHtml />}>
          <StaticShoe config={config} />
          <ContactShadows
            position={[0, -0.61, 0]}
            opacity={0.7}
            scale={5}
            blur={1.8}
            far={1.5}
            resolution={512}
          />
        </Suspense>

        <OrbitControls
          makeDefault
          autoRotate
          autoRotateSpeed={1.5}
          enablePan={false}
          minDistance={1.5}
          maxDistance={3.2}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>
    </div>
  );
};

useGLTF.preload(MODEL_PATH, DRACO_DECODER_PATH);

export default Product3DViewer;
