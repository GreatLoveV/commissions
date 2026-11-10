import { z } from "zod";
import { parseMoney } from "@/lib/money";

// an amount typed as text ("120" or "49.99"), turned into minor units
const amount = z
  .string()
  .refine((value) => {
    const minor = parseMoney(value);
    return minor !== null && minor > 0;
  }, "Enter an amount above zero, like 120 or 49.99")
  .transform((value) => parseMoney(value) as number);

export const quoteSchema = z.object({
  price: amount,
  message: z.string().trim().max(1000, "Use at most 1000 characters"),
});

export const paymentSchema = z.object({
  kind: z.enum(["DEPOSIT", "FINAL"], "Choose deposit or final payment"),
  amount,
  // a checkbox sends "on" when ticked and nothing when not
  paid: z.string().transform((value) => value === "on"),
  note: z.string().trim().max(200, "Use at most 200 characters"),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
