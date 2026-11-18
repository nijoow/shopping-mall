export const COLOR_FAMILIES = [
  'BLACK',
  'WHITE',
  'RED',
  'BLUE',
  'GREEN',
] as const;

export type ColorFamily = (typeof COLOR_FAMILIES)[number];

export const isColorFamily = (value: string): value is ColorFamily =>
  (COLOR_FAMILIES as readonly string[]).includes(value);

/**
 * hex 컬러를 필터용 색상 계열로 분류한다.
 * 상품 색상이 자유로운 hex 값으로 저장되어 있어, 명도/채널 우세로 근사 분류한다.
 * 분류할 수 없는 색(회색·혼합색 등)은 null.
 */
export const getColorFamily = (hex: string): ColorFamily | null => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;

  const value = parseInt(match[1], 16);
  /* eslint-disable no-bitwise */
  const red = (value >> 16) & 0xff;
  const green = (value >> 8) & 0xff;
  const blue = value & 0xff;
  /* eslint-enable no-bitwise */

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2 / 255;

  if (lightness < 0.16) return 'BLACK';
  if (lightness > 0.85 && max - min < 40) return 'WHITE';
  if (max - min < 30) return null; // 무채색(회색)은 별도 계열 없음

  if (red === max && red - Math.max(green, blue) > 30) return 'RED';
  if (green === max && green - Math.max(red, blue) > 30) return 'GREEN';
  if (blue === max && blue - Math.max(red, green) > 30) return 'BLUE';

  return null;
};
