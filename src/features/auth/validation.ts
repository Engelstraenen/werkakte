import { z } from 'zod';

export const emailSchema = z.email();
// Supabase-OTP ist je nach Projekteinstellung 6–10 Ziffern lang.
export const otpSchema = z.string().regex(/^\d{6,10}$/);
