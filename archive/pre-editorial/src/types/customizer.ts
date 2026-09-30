/** 3D 스니커즈 커스터마이저 도메인 타입 */

export type ShoePart =
  | 'main'
  | 'upper'
  | 'sideDesign'
  | 'midSole'
  | 'bottomSole'
  | 'heelSupport'
  | 'laces';

export type ShoeConfig = Record<ShoePart, string>;

/** NIJOOW 스트릿 시그니처 프리셋 */
export type StreetPreset = 'VOLT_RUNNER' | 'SEOUL_NIGHT' | 'OG_PAPER' | 'CONCRETE';

/** 조명 무드 */
export type StudioLighting = 'street' | 'studio' | 'sunset';

export interface StreetPresetData {
  name: string;
  description: string;
  /** UI 뱃지/보더에 쓰이는 대표 색 */
  themeColor: string;
  /** 힐에 새겨지는 커스텀 태그 (0~2자리 숫자) */
  tagNumber: string;
  colors: ShoeConfig;
}
