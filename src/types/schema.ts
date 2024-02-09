import { phoneRegex } from '@/lib/utils/regex';
import { z } from 'zod';

export const addressFormSchema = z.object({
  name: z.string(),
  phoneNumber: z.string().regex(phoneRegex),
  postCode: z.string(),
  address: z.string(),
  detailAddress: z.string().nullable(),
});
