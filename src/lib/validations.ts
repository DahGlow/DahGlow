import { z } from 'zod';
export const authSchema = z.object({ email:z.string().email('Enter a valid email address'), password:z.string().min(6,'Use at least 6 characters'), otp:z.string().optional() });
export type AuthFields = z.infer<typeof authSchema>;
