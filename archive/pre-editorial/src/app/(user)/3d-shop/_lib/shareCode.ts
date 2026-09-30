import {
  ShoeConfig,
  ShoePart,
  StreetPreset,
  StudioLighting,
} from '@/types/customizer';
import { SHOE_PARTS, STREET_PRESETS } from './customizerStore';

/**
 * 공유 URL의 ?code= 파라미터 인코딩/디코딩.
 * 외부에서 주입되는 값이므로 디코딩 시 모든 필드를 화이트리스트로 검증한다.
 */

export interface ShareCodeData {
  preset: StreetPreset | null;
  tagNumber: string;
  lighting: StudioLighting;
  config: ShoeConfig;
}

export interface DecodedShareCode {
  preset?: StreetPreset;
  tagNumber?: string;
  lighting?: StudioLighting;
  config?: Partial<ShoeConfig>;
}

const LIGHTINGS: readonly StudioLighting[] = ['street', 'studio', 'sunset'];
const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;
const TAG_RE = /^[0-9]{0,2}$/;

const isPreset = (v: unknown): v is StreetPreset =>
  typeof v === 'string' && v in STREET_PRESETS;

const isLighting = (v: unknown): v is StudioLighting =>
  typeof v === 'string' && (LIGHTINGS as readonly string[]).includes(v);

export const encodeShareCode = (data: ShareCodeData): string =>
  // base64의 +, /, = 는 URL에서 깨질 수 있으므로 URL-safe 문자로 치환
  btoa(JSON.stringify(data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

export const decodeShareCode = (code: string): DecodedShareCode | null => {
  let raw: unknown;
  try {
    const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
    raw = JSON.parse(atob(b64));
  } catch {
    return null;
  }
  if (typeof raw !== 'object' || raw === null) return null;

  const data = raw as Record<string, unknown>;
  const result: DecodedShareCode = {};

  if (isPreset(data.preset)) result.preset = data.preset;
  if (typeof data.tagNumber === 'string' && TAG_RE.test(data.tagNumber)) {
    result.tagNumber = data.tagNumber;
  }
  if (isLighting(data.lighting)) result.lighting = data.lighting;

  if (typeof data.config === 'object' && data.config !== null) {
    const config: Partial<Record<ShoePart, string>> = {};
    SHOE_PARTS.forEach(part => {
      const color = (data.config as Record<string, unknown>)[part];
      if (typeof color === 'string' && HEX_COLOR_RE.test(color)) {
        config[part] = color;
      }
    });
    if (Object.keys(config).length > 0) result.config = config;
  }

  return result;
};
