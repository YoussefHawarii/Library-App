import { z } from "zod";

// Mirrors the backend Joi schemas in src/modules/user/user.validation.js —
// kept in sync manually since the backend doesn't publish a shared schema.
export const sendOtpSchema = z.object({
  name: z.string().trim().min(3, "At least 3 characters").max(15, "At most 15 characters"),
  email: z.string().trim().email("Enter a valid email"),
});
export type SendOtpForm = z.infer<typeof sendOtpSchema>;

export const signUpSchema = z.object({
  name: z.string().trim().min(3, "At least 3 characters").max(30, "At most 30 characters"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Digits only, no letters"),
  otp: z.string().trim().length(5, "OTP is 5 digits"),
});
export type SignUpForm = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
export type LoginForm = z.infer<typeof loginSchema>;
