"use server";

import { revalidatePath } from "next/cache";
import { text, type FormState } from "@/lib/form";
import { notifyArtist, notifyClient } from "@/lib/notifications";
import { answerQuote } from "@/lib/requests";

// The client answers the artist's quote. Which button was pressed arrives
// as the "answer" field, the price they were looking at as "seenPrice".
export async function answer(
  token: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const choice = text(formData, "answer");
  const seenPrice = Number(text(formData, "seenPrice"));
  if ((choice !== "approve" && choice !== "decline") || !Number.isInteger(seenPrice)) {
    return { message: "Choose approve or decline." };
  }

  const approve = choice === "approve";
  const result = await answerQuote(token, approve, seenPrice);
  if (!result.ok) return { message: result.error };

  await notifyArtist(result.requestId, approve ? "quote_approved" : "quote_declined");
  await notifyClient(result.requestId);

  revalidatePath(`/r/${token}`, "layout");
  revalidatePath("/dashboard");
  return { ok: true };
}
