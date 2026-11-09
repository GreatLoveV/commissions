import { z } from "zod";
import { parseMoney } from "@/lib/money";

export const MAX_TYPES_PER_ARTIST = 20;

export const commissionTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a name")
    .max(60, "Use at most 60 characters"),
  description: z.string().trim().max(500, "Use at most 500 characters"),
  // typed as text ("50" or "49.99"), stored as minor units
  basePrice: z
    .string()
    .refine((value) => parseMoney(value) !== null, "Enter a price like 50 or 49.99")
    .transform((value) => parseMoney(value) as number),
  turnaroundDays: z.coerce
    .number("Enter a number of days")
    .int("Use whole days")
    .min(1, "At least 1 day")
    .max(365, "At most 365 days"),
});
