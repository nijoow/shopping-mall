'use client';
import { useGLTF, OrbitControls, ContactShadows } from '@react-three/drei';
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber';
import { Suspense, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import { modelAsset, type DesignConfig, type Part } from '@/domain/catalog';
import type { ViewerProps } from './ProductViewer';
import { createSurface } from './materials';

export function clearModelCache(config: DesignConfig) {
  useGLTF.clear(modelAsset(config));
}

function Model({
  config,
  selected,
  onSelect,
  onCaptureReady,
  cameraView,
  zoom = 1.2,
}: ViewerProps) {
  const gltf = useGLTF(modelAsset(config));
  const { invalidate, gl, scene: root, camera } = useThree();
  const { scene, originals } = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const originals = new Map<
      THREE.Material,
      { map: THREE.Texture | null; normal: THREE.Texture | null }
    >();
    clone.traverse(o => {
      if (o instanceof THREE.Mesh) {
        o.material = Array.isArray(o.material)
          ? o.material.map(m => m.clone())
          : o.material.clone();
        o.castShadow = true;
        o.receiveShadow = true;
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          if (m instanceof THREE.MeshStandardMaterial)
            originals.set(m, { map: m.map, normal: m.normalMap });
      }
    });
    return { scene: clone, originals };
  }, [gltf.scene]);
  const surfaces = useMemo(
    () => ({
      mesh: createSurface('mesh'),
      leather: createSurface('leather'),
      suede: createSurface('suede'),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(surfaces).forEach(s => s.dispose());
    },
    [surfaces],
  );
  useEffect(() => {
    scene.traverse(o => {
      if (!(o instanceof THREE.Mesh)) return;
      const materials = Array.isArray(o.material) ? o.material : [o.material];
      materials.forEach(material => {
        if (!(material instanceof THREE.MeshStandardMaterial)) return;
        const part = material.name.split('.')[0] as Part;
        if (config.colors[part]) material.color.set(config.colors[part]);
        if (part === 'upper') {
          material.roughness =
            config.material === 'leather'
              ? 0.4
              : config.material === 'suede'
                ? 0.98
                : 0.78;
          material.metalness = 0;
          const source = originals.get(material);
          material.map =
            config.material === 'mesh' && config.model === 'runner'
              ? (source?.map ?? null)
              : surfaces[config.material].map;
          material.normalMap =
            config.material === 'mesh' && config.model === 'runner'
              ? (source?.normal ?? null)
              : surfaces[config.material].normal;
          material.normalScale.setScalar(
            config.material === 'suede' ? 0.32 : 0.18,
          );
          material.needsUpdate = true;
        }
        material.emissive.set(part === selected ? '#25221c' : '#000000');
        material.emissiveIntensity = part === selected ? 0.13 : 0;
      });
    });
    invalidate();
  }, [config, selected, scene, invalidate, originals, surfaces]);
  useEffect(
    () => () => {
      scene.traverse(o => {
        if (o instanceof THREE.Mesh)
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(m =>
            m.dispose(),
          );
      });
    },
    [scene],
  );
  useEffect(() => {
    const positions: Record<string, [number, number, number]> = {
      front: [3.8, 1.65, 4.8],
      side: [0.15, 0.6, 5.4],
      heel: [-5, 1.2, 0.5],
      sole: [0.2, -4.8, 2.2],
    };
    camera.position.set(
      ...(positions[cameraView ?? 'front'] ?? positions.front),
    );
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [cameraView, camera, invalidate]);
  useEffect(() => {
    if (
      camera instanceof THREE.PerspectiveCamera ||
      camera instanceof THREE.OrthographicCamera
    ) {
      // R3F exposes a mutable Three.js camera, not a React state snapshot.
      // eslint-disable-next-line react-hooks/immutability
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
      invalidate();
    }
  }, [zoom, camera, invalidate]);
  useEffect(() => {
    onCaptureReady?.((format = 'image/webp') => {
      gl.render(root, camera);
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 384;
      const ctx = canvas.getContext('2d');
      const factor = Math.min(
        512 / gl.domElement.width,
        384 / gl.domElement.height,
      );
      const w = gl.domElement.width * factor,
        h = gl.domElement.height * factor;
      ctx?.drawImage(gl.domElement, (512 - w) / 2, (384 - h) / 2, w, h);
      return canvas.toDataURL(format, 0.8);
    });
  }, [onCaptureReady, gl, root, camera]);
  const stamp = useMemo(() => {
    if (!config.engraving) return null;
    scene.updateMatrixWorld(true);
    const revisedLow = config.model === 'low' && config.modelVersion === 2;
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-0.75, revisedLow ? 0.02 : -0.18, 4),
      new THREE.Vector3(0, 0, -1),
    );
    const hits = ray.intersectObject(scene, true);
    const hit =
      hits.find(
        h =>
          h.object instanceof THREE.Mesh &&
          (Array.isArray(h.object.material)
            ? h.object.material[0]
            : h.object.material
          ).name.split('.')[0] === (revisedLow ? 'panel' : 'upper'),
      ) ?? hits.find(h => h.object instanceof THREE.Mesh);
    if (!hit || !(hit.object instanceof THREE.Mesh)) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle =
      new THREE.Color(
        revisedLow ? config.colors.panel : config.colors.upper,
      ).getHSL({ h: 0, s: 0, l: 0 }).l < 0.3
        ? '#eeeae2'
        : '#252525';
    ctx.font = 'bold 92px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.engraving, 256, 80, 480);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const geometry = new DecalGeometry(
      hit.object,
      hit.point,
      new THREE.Euler(0, 0, 0),
      new THREE.Vector3(0.5, 0.15, 0.12),
    );
    return { geometry, texture };
  }, [
    scene,
    config.engraving,
    config.colors.upper,
    config.colors.panel,
    config.model,
    config.modelVersion,
  ]);
  useEffect(
    () => () => {
      stamp?.geometry.dispose();
      stamp?.texture.dispose();
    },
    [stamp],
  );
  function click(event: ThreeEvent<MouseEvent>) {
    if (!onSelect || !(event.object instanceof THREE.Mesh)) return;
    event.stopPropagation();
    const material = Array.isArray(event.object.material)
      ? event.object.material[0]
      : event.object.material;
    const part = material.name.split('.')[0] as Part;
    if (config.colors[part]) onSelect(part);
  }
  return (
    <group onClick={click}>
      <primitive object={scene} />
      {stamp && (
        <mesh geometry={stamp.geometry}>
          <meshStandardMaterial
            map={stamp.texture}
            transparent
            polygonOffset
            polygonOffsetFactor={-4}
            depthWrite={false}
            roughness={0.9}
          />
        </mesh>
      )}
    </group>
  );
}
export default function ShoeCanvas(props: ViewerProps) {
  return (
    <Canvas
      className="shoe-canvas"
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [3.8, 1.65, 4.8], fov: 35 }}
      gl={{ alpha: true, antialias: true }}
      fallback={
        <div className="viewer-fallback">
          이 기기에서는 사진으로 상품을 확인할 수 있어.
        </div>
      }
    >
      <color attach="background" args={['#e7e5de']} />
      <ambientLight intensity={1.35} />
      <directionalLight position={[3, 5, 6]} intensity={3} />
      <directionalLight position={[-4, 2, -3]} intensity={2.4} />
      <Suspense fallback={null}>
        <Model {...props} />
        <ContactShadows
          position={[0, -0.8, 0]}
          opacity={0.24}
          scale={8}
          blur={2.5}
          far={2}
          resolution={256}
          frames={1}
        />
      </Suspense>
      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 12}
        maxPolarAngle={Math.PI * 0.9}
      />
    </Canvas>
  );
}
