'use client';

import { createStore, useStore } from '@/lib/store';
import {
  ShoeConfig,
  ShoePart,
  StreetPreset,
  StreetPresetData,
  StudioLighting,
} from '@/types/customizer';

/** NIJOOW 시그니처 컬러웨이 */
export const STREET_PRESETS: Record<StreetPreset, StreetPresetData> = {
  VOLT_RUNNER: {
    name: 'VOLT RUNNER',
    description: '한밤의 트랙을 밝히는 볼트 옐로우. NIJOOW 오리지널.',
    themeColor: '#d7ff00',
    tagNumber: '01',
    colors: {
      main: '#16161a',
      upper: '#26262c',
      sideDesign: '#d7ff00',
      midSole: '#f4f2ec',
      bottomSole: '#d7ff00',
      heelSupport: '#16161a',
      laces: '#d7ff00',
    },
  },
  SEOUL_NIGHT: {
    name: 'SEOUL NIGHT',
    description: '네온 핑크와 시안이 흐르는 새벽의 을지로.',
    themeColor: '#ff2e88',
    tagNumber: '02',
    colors: {
      main: '#101018',
      upper: '#1b1b26',
      sideDesign: '#ff2e88',
      midSole: '#22d3ee',
      bottomSole: '#101018',
      heelSupport: '#ff2e88',
      laces: '#f4f2ec',
    },
  },
  OG_PAPER: {
    name: 'OG PAPER',
    description: '빈티지 페이퍼 톤과 검 솔. 클래식은 영원하다.',
    themeColor: '#e8e4d8',
    tagNumber: '93',
    colors: {
      main: '#f0ede3',
      upper: '#e0dccc',
      sideDesign: '#1c1c1f',
      midSole: '#f4f2ec',
      bottomSole: '#c8a06a',
      heelSupport: '#e0dccc',
      laces: '#f0ede3',
    },
  },
  CONCRETE: {
    name: 'CONCRETE',
    description: '도시의 콘크리트 그레이 톤온톤 무드.',
    themeColor: '#9ca3af',
    tagNumber: '88',
    colors: {
      main: '#6b7280',
      upper: '#9ca3af',
      sideDesign: '#1f2937',
      midSole: '#d1d5db',
      bottomSole: '#1f2937',
      heelSupport: '#4b5563',
      laces: '#e5e7eb',
    },
  },
};

/** 커스텀 팔레트 (스와치) */
export const COLOR_PALETTE = [
  '#16161a',
  '#f4f2ec',
  '#d7ff00',
  '#ff2e88',
  '#22d3ee',
  '#7c3aed',
  '#fb923c',
  '#16a34a',
  '#e11d48',
  '#c8a06a',
  '#6b7280',
  '#2563eb',
] as const;

export const PART_LABELS: Record<ShoePart, string> = {
  main: '메인 바디',
  upper: '어퍼',
  sideDesign: '사이드 라인',
  midSole: '미드솔',
  bottomSole: '아웃솔',
  heelSupport: '힐 서포트',
  laces: '레이스',
};

export const SHOE_PARTS = Object.keys(PART_LABELS) as ShoePart[];

export interface CustomizerState {
  currentPart: ShoePart;
  hoveredPart: ShoePart | null;
  config: ShoeConfig;
  tagNumber: string;
  preset: StreetPreset | null;
  lighting: StudioLighting;
}

const initialState: CustomizerState = {
  currentPart: 'main',
  hoveredPart: null,
  config: { ...STREET_PRESETS.VOLT_RUNNER.colors },
  tagNumber: STREET_PRESETS.VOLT_RUNNER.tagNumber,
  preset: 'VOLT_RUNNER',
  lighting: 'street',
};

export const customizerStore = createStore<CustomizerState>(initialState);

export const customizerActions = {
  setCurrentPart: (part: ShoePart) => customizerStore.setState({ currentPart: part }),
  setHoveredPart: (part: ShoePart | null) =>
    customizerStore.setState({ hoveredPart: part }),
  /** 색을 직접 만지는 순간 프리셋 선택은 해제된다 */
  setPartColor: (part: ShoePart, color: string) =>
    customizerStore.setState(state => ({
      config: { ...state.config, [part]: color },
      preset: null,
    })),
  setTagNumber: (tagNumber: string) => customizerStore.setState({ tagNumber }),
  setPreset: (preset: StreetPreset) =>
    customizerStore.setState({
      preset,
      config: { ...STREET_PRESETS[preset].colors },
      tagNumber: STREET_PRESETS[preset].tagNumber,
    }),
  setLighting: (lighting: StudioLighting) => customizerStore.setState({ lighting }),
  hydrate: (partial: Partial<CustomizerState>) => customizerStore.setState(partial),
  reset: () => customizerStore.setState({ ...initialState, config: { ...initialState.config } }),
};

export const useCustomizer = <U,>(selector: (state: CustomizerState) => U): U =>
  useStore(customizerStore, selector);
