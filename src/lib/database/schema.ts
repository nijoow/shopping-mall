import { sql } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { phoneRegex } from '../../utils';

export const userSchema = z.object({
  user_id: z.number(),
  email: z.string().email(),
  login_provider: z.enum(['SOCIAL_LOGIN', 'CREDENTIALS']),
  role: z.enum(['ADMIN', 'USER']),
  nickname: z.string(),
  name: z.string().nullable(),
  gender: z.enum(['MALE', 'FEMALE']).nullable(),
  birth: z.string().nullable(),
  phone_number: z.string().regex(phoneRegex).nullable(),
  point: z.number(),
  created_date: z.date(),
  modified_date: z.date(),
});

export const addressSchema = z.object({
  address_id: z.number(),
  user_id: z.number(),
  address: z.string(),
  detail_address: z.string().nullable(),
  post_code: z.string(),
  name: z.string(),
  phone_number: z.string().regex(phoneRegex),
});

export const products = pgTable('products', {
  productId: serial('productId').primaryKey(),
  productName: text('productName').notNull(),
  category: text('category').notNull(),
  imageUrl: text('imageUrl').notNull(),
  price: integer('price').notNull(),
  description: text('description'),
  stock: integer('stock').notNull(),
  sell: integer('sell').notNull(),
  gender: text('gender').$type<'MALE' | 'FEMALE'>(),
  colors: text('colors')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  sizes: text('sizes')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  color: text('color').notNull(),
  createdDate: timestamp('createdDate').notNull(),
  modifiedDate: timestamp('modifiedDate').notNull(),
});

export const productSchema = createSelectSchema(products, {
  colors: z.string().array(),
  sizes: z.string().array(),
  gender: z.enum(['MALE', 'FEMALE']).nullable(),
});

export const orderSchema = z.object({
  order_id: z.number(),
  user_id: z.number(),
  status: z.enum(['PAID', 'SHIPPING', 'DELIVERED', 'CANCELLED']),
  total_amount: z.number(),
  recipient_name: z.string(),
  phone_number: z.string(),
  post_code: z.string(),
  address: z.string(),
  detail_address: z.string().nullable(),
  created_date: z.date(),
});

export const orderItemSchema = z.object({
  order_item_id: z.number(),
  order_id: z.number(),
  product_id: z.number(),
  product_name: z.string(),
  price: z.number(),
  quantity: z.number(),
  size: z.string().nullable(),
  color: z.string().nullable(),
});
