import { z } from "zod";
import { emailSchema } from "@/lib/validation/auth";

const DAY_MS = 24 * 60 * 60 * 1000;

// The deadline arrives from <input type="date"> as "2026-12-24" or as an
// empty string when the client leaves it out.
function parseDeadline(value: string): Date | null | "invalid" {
  if (value === "") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "invalid";

  const date = new Date(`${value}T00:00:00Z`);
  // "2026-02-31" parses to an invalid date or rolls over to March
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return "invalid";
  }

  const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
  const tooSoon = date.getTime() <= today;
  const tooFar = date.getTime() > today + 730 * DAY_MS;
  return tooSoon || tooFar ? "invalid" : date;
}

export const requestSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(1, "Enter your name")
    .max(80, "Use at most 80 characters"),
  clientEmail: emailSchema,
  description: z
    .string()
    .trim()
    .min(20, "Describe what you want in at least 20 characters")
    .max(4000, "Use at most 4000 characters"),
  usage: z.enum(["PERSONAL", "COMMERCIAL"], "Choose personal or commercial use"),
  deadline: z
    .string()
    .trim()
    .refine(
      (value) => parseDeadline(value) !== "invalid",
      "Pick a date after today and within the next two years, or leave it empty",
    )
    .transform((value) => parseDeadline(value) as Date | null),
});

export type RequestInput = z.infer<typeof requestSchema>;
