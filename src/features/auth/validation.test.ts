import { emailSchema, otpSchema } from './validation';

test('E-Mail', () => {
  expect(emailSchema.safeParse('meister@betrieb.de').success).toBe(true);
  expect(emailSchema.safeParse('meister@').success).toBe(false);
  expect(emailSchema.safeParse('').success).toBe(false);
});

test('Code', () => {
  expect(otpSchema.safeParse('123456').success).toBe(true);
  expect(otpSchema.safeParse('12345').success).toBe(false);
  expect(otpSchema.safeParse('12a456').success).toBe(false);
});
