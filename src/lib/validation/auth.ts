import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email("Enter a valid email"));

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(80),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(128, "Use at most 128 characters"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(128),
});
