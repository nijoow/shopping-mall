'use server';

import { createOrder } from '@/lib/database/order';
import { auth } from 'auth';
import { z } from 'zod';

const placeOrderSchema = z.object({
  addressId: z.number().int().positive(),
  lines: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(99),
        size: z.string().nullable(),
      }),
    )
    .min(1),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export type PlaceOrderResult =
  | { ok: true; orderId: number }
  | { ok: false; message: string };

/** 목업 결제 — 실제 PG 없이 주문을 확정한다. */
export const placeOrder = async (
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> => {
  const session = await auth();
  const userId = session?.user.user_id;
  if (!userId) return { ok: false, message: '로그인이 필요합니다.' };

  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: '주문 정보가 올바르지 않습니다.' };
  }

  try {
    const orderId = await createOrder({
      userId,
      addressId: parsed.data.addressId,
      lines: parsed.data.lines.map(line => ({ ...line, color: null })),
    });
    return { ok: true, orderId };
  } catch (error) {
    const message = (error as Error).message ?? '';
    if (message.startsWith('OUT_OF_STOCK')) {
      return {
        ok: false,
        message: `재고가 부족한 상품이 있어요: ${message.split(':')[1] ?? ''}`,
      };
    }
    if (message === 'ADDRESS_NOT_FOUND') {
      return { ok: false, message: '배송지를 다시 선택해주세요.' };
    }
    return { ok: false, message: '주문 처리에 실패했어요. 잠시 후 다시 시도해주세요.' };
  }
};
