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
  thumbnailImageUrl: text('thumbnailImageUrl').notNull(),
  price: integer('price').notNull(),
  description: text('description'),
  stock: integer('stock').notNull(),
  sell: integer('stock'),
  colors: text('colors'),
  createdDate: timestamp('createdDate'),
  modifiedDate: timestamp('modifiedDate'),
});

export const productSchema = createSelectSchema(products);
