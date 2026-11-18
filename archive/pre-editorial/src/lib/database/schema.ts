import { sql } from 'drizzle-orm';
import {
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { phoneRegex } from '../../utils';

// NOTE: users/address 는 아직 zod 스키마로 관리한다(점진 이관 예정). 실 DB의
// users 는 birth 대신 age 컬럼을 가지는 등 아래 zod 와 일부 드리프트가 있음 —
// BACKLOG의 "DB 스키마 일원화" 참고.
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

export const orders = pgTable('orders', {
  orderId: serial('order_id').primaryKey(),
  userId: integer('user_id').notNull(),
  status: varchar('status')
    .$type<'PAID' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'>()
    .notNull()
    .default('PAID'),
  totalAmount: integer('total_amount').notNull(),
  recipientName: varchar('recipient_name').notNull(),
  phoneNumber: varchar('phone_number').notNull(),
  postCode: varchar('post_code').notNull(),
  address: varchar('address').notNull(),
  detailAddress: varchar('detail_address'),
  createdDate: timestamp('created_date').notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  orderItemId: serial('order_item_id').primaryKey(),
  orderId: integer('order_id').notNull(),
  productId: integer('product_id').notNull(),
  productName: varchar('product_name').notNull(),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull(),
  size: varchar('size'),
  color: varchar('color'),
});

export const socialLogins = pgTable(
  'social_logins',
  {
    userId: integer('user_id').notNull(),
    accountId: varchar('account_id').notNull(),
    type: varchar('type').notNull(),
  },
  table => ({ pk: primaryKey({ columns: [table.userId, table.type] }) }),
);

export const credentials = pgTable('credentials', {
  userId: integer('user_id').primaryKey(),
  password: varchar('password').notNull(),
});

/**
 * 조회용 zod 스키마 — 컬럼명은 실 DB(snake_case)를 따른다.
 * order.ts 가 raw SQL 결과를 이 shape 으로 다루므로 스네이크 케이스로 유지.
 */
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
