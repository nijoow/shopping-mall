import { addressSchema, userSchema } from '@/lib/database/schema';
import { z } from 'zod';
import { addressFormSchema } from './schema';

export type AuthPassword = {
  user_id: number;
  password: string;
};

export type User = z.infer<typeof userSchema>;

export type Address = z.infer<typeof addressSchema>;

export type AddressFormInput = z.infer<typeof addressFormSchema>;
