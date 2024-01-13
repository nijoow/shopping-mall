import { userSchema } from '@/lib/database/schema';
import { z } from 'zod';

export type AuthPassword = {
  user_id: number;
  password: string;
};

export type User = z.infer<typeof userSchema>;
