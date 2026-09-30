import { z } from 'zod';
import {
  defaultConfig,
  findProduct,
  type DesignConfig,
  MAX_QUANTITY,
} from './catalog';

const hex = z
  .string()
  .regex(/^#[0-9a-f]{6}$/i)
  .transform(v => v.toLowerCase());
export const configSchema = z
  .object({
    model: z.enum(['runner', 'low']),
    modelVersion: z.union([z.literal(1), z.literal(2)]),
    colors: z
      .object({ upper: hex, panel: hex, sole: hex, laces: hex })
      .strict(),
    material: z.enum(['mesh', 'leather', 'suede']),
    engraving: z
      .string()
      .max(8)
      .regex(/^[A-Z0-9 ]*$/),
  })
  .strict()
  .refine(config => config.model === 'low' || config.modelVersion === 1, {
    message: '지원하지 않는 모델 버전이야.',
    path: ['modelVersion'],
  });
export const previewSchema = z
  .string()
  .max(180000)
  .regex(/^data:image\/(webp|png);base64,[A-Za-z0-9+/=]+$/)
  .nullable()
  .optional();
export class DomainError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function productInput(input: unknown) {
  const parsed = z
    .object({
      productId: z.string(),
      size: z.string(),
      quantity: z.number().int().min(1).max(MAX_QUANTITY),
      config: configSchema.nullable().optional(),
      preview: previewSchema,
    })
    .strict()
    .parse(input);
  const product = findProduct(parsed.productId);
  if (!product)
    throw new DomainError(
      'PRODUCT_NOT_FOUND',
      '더 이상 구매할 수 없는 상품이야.',
    );
  if (!product.sizes.includes(parsed.size))
    throw new DomainError('INVALID_SIZE', '구매 가능한 사이즈를 선택해줘.');
  const config: DesignConfig | null = product.model
    ? (parsed.config ?? defaultConfig(product.model))
    : null;
  if (
    parsed.config &&
    (!product.model || parsed.config.model !== product.model)
  )
    throw new DomainError('INVALID_CONFIG', '상품과 디자인이 일치하지 않아.');
  return { ...parsed, config, product };
}
export const idSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-zA-Z0-9_-]+$/);
export function configKey(config: DesignConfig | null) {
  if (!config) return '';
  return JSON.stringify([
    config.model,
    config.modelVersion,
    config.colors.upper,
    config.colors.panel,
    config.colors.sole,
    config.colors.laces,
    config.material,
    config.engraving,
  ]);
}
