import { z } from 'zod';
import { phoneRegex } from '../utils/regex';

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

export const productSchema = z.object({
  productId: z.number(),
  productName: z.string(),
  category: z.string(),
  thumbnailImageUrl: z.string(),
  price: z.number(),
  description: z.string(),
  stock: z.number(),
  sell: z.number(),
  colors: z.array(z.string()),
  createdDate: z.date(),
  modifiedDate: z.date(),
});
