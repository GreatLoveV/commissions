import { z } from "zod";

// The public page lives at /<handle>, so a handle can never be the same
// as one of our own top level routes (or something we may add later).
export const RESERVED_HANDLES = new Set([
  "about",
  "admin",
  "api",
  "app",
  "blog",
  "contact",
  "dashboard",
  "help",
  "login",
  "logout",
  "new",
  "onboarding",
  "pricing",
  "privacy",
  "r",
  "settings",
  "signup",
  "static",
  "support",
  "terms",
  "uploads",
  "www",
]);

export const CURRENCIES = ["USD", "EUR", "GBP", "MAD"] as const;

export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Use at least 3 characters")
  .max(30, "Use at most 30 characters")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and single hyphens",
  )
  .refine((handle) => !RESERVED_HANDLES.has(handle), "That handle is reserved");

const displayName = z
  .string()
  .trim()
  .min(1, "Enter a display name")
  .max(60, "Use at most 60 characters");

export const onboardingSchema = z.object({
  handle: handleSchema,
  displayName,
});

export const profileSchema = z.object({
  handle: handleSchema,
  displayName,
  bio: z.string().trim().max(500, "Use at most 500 characters"),
  currency: z.enum(CURRENCIES, "Pick a currency from the list"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
