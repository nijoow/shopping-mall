'use client';

import {
  DRACO_DECODER_PATH,
  GROUPED_MESHES,
  MODEL_PATH,
  ROOT_MESHES,
} from '@/lib/shoeModel';
import { ShoePart } from '@/types/customizer';
import { Center, Text, useGLTF } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { customizerActions, useCustomizer } from '../_lib/customizerStore';

const VOLT = new THREE.Color('#d7ff00');
const VOLT_DIM = new THREE.Color('#5c6b00');
const BLACK = new THREE.Color('#000000');

const Shoe = () => {
  const { nodes } = useGLTF(MODEL_PATH, DRACO_DECODER_PATH) as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };
  const config = useCustomizer(state => state.config);
  const currentPart = useCustomizer(state => state.currentPart);
  const hoveredPart = useCustomizer(state => state.hoveredPart);
  const tagNumber = useCustomizer(state => state.tagNumber);

  const getMaterialProps = (part: ShoePart) => {
    const isSelected = currentPart === part;
    const isHovered = hoveredPart === part;

    let emissive = BLACK;
    let emissiveIntensity = 0;
    if (isSelected) {
      emissive = VOLT;
      emissiveIntensity = 0.12;
    } else if (isHovered) {
      emissive = VOLT_DIM;
      emissiveIntensity = 0.06;
    }

    return {
      color: new THREE.Color(config[part]),
      roughness: isSelected || isHovered ? 0.35 : 0.6,
      metalness: part === 'sideDesign' || part === 'midSole' ? 0.25 : 0.05,
      emissive,
      emissiveIntensity,
    };
  };

  const createHandlers = (part: ShoePart) => ({
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      customizerActions.setCurrentPart(part);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      customizerActions.setHoveredPart(part);
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      customizerActions.setHoveredPart(null);
      document.body.style.cursor = 'auto';
    },
  });

  // GLB 노드의 로컬 transform을 그대로 유지하며 메쉬 렌더링
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
        {...createHandlers(part)}
      >
        <meshStandardMaterial {...getMaterialProps(part)} />
      </mesh>
    );
  };

  return (
    // Center로 원점 정렬 후 3/4 제품샷 각도를 초기 뷰로 설정
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

        {/* 힐 커스텀 태그 넘버 (3D 자수) */}
        {tagNumber && (
          <group position={[-0.43, 0.45, -1.25]} rotation={[0, -Math.PI / 1.9, -0.05]}>
            <Text
              color={config.laces}
              fontSize={0.22}
              // troika-three-text는 woff2 미지원 → 로컬 TTF 사용
              font="/fonts/Outfit-Bold.ttf"
              anchorX="center"
              anchorY="middle"
              depthOffset={-1.5}
            >
              {tagNumber}
            </Text>
          </group>
        )}
      </group>
    </Center>
  );
};

useGLTF.preload(MODEL_PATH, DRACO_DECODER_PATH);

export default Shoe;
