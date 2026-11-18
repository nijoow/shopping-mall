import { ShoePart } from '@/types/customizer';

/** shoe.glb 공용 상수 — 3D 커스텀 랩과 상품 상세 뷰어가 함께 쓴다 */

// Draco 압축 GLB — 디코더는 로컬에서 서빙 (CDN 의존 제거)
export const MODEL_PATH = '/models/shoe.glb';
export const DRACO_DECODER_PATH = '/draco/';

// GLB 메쉬 노드 이름 → 커스터마이징 파트 매핑 (씬 루트 메쉬)
export const ROOT_MESHES: Record<string, ShoePart> = {
  Laces: 'laces',
  Stitches: 'laces',
  Sides: 'sideDesign',
  Front: 'sideDesign',
  NikeLogo1: 'midSole',
  NikeLogo2: 'midSole',
  Parent001: 'midSole',
  Very_bottum: 'bottomSole',
  AIr_Max_Logo_1: 'heelSupport',
  AIr_Max_Logo_2: 'heelSupport',
  Back: 'heelSupport',
  Rings: 'heelSupport',
  Hook: 'heelSupport',
  Middle_back: 'heelSupport',
};

// 자체 transform을 가진 그룹 노드 하위 메쉬 — 그룹 transform 유지 필수
export const GROUPED_MESHES: {
  group: string;
  meshes: Record<string, ShoePart>;
}[] = [
  { group: 'Main', meshes: { Cube004: 'main', Cube004_1: 'upper' } },
  { group: 'Back_Pad', meshes: { Cube002: 'upper', Cube002_1: 'heelSupport' } },
  { group: 'Flap', meshes: { Plane: 'upper', Plane_1: 'heelSupport' } },
];
