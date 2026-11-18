import {
  addressSchema,
  orderItemSchema,
  orderSchema,
  productSchema,
  userSchema,
} from '@/lib/database/schema';
import { z } from 'zod';
import { addressFormSchema } from './schema';

export type AuthPassword = {
  user_id: number;
  password: string;
};

export type User = z.infer<typeof userSchema>;

export type Address = z.infer<typeof addressSchema>;

export type AddressFormInput = z.infer<typeof addressFormSchema>;

export type Product = z.infer<typeof productSchema>;

export type Order = z.infer<typeof orderSchema>;

export type OrderItem = z.infer<typeof orderItemSchema>;

/** 주문 상세 — 주문 1건 + 그 항목들 */
export type OrderWithItems = Order & { items: OrderItem[] };

export type Categories = 'OUTER' | 'TOP' | 'BOTTOM' | 'SHOES' | 'ACCESSORY';

export type Gender = 'MALE' | 'FEMALE';
