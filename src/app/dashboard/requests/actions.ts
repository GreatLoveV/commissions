"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  addPayment,
  deletePayment,
  moveRequest,
  sendQuote,
  setPaymentPaid,
} from "@/lib/artist-requests";
import { text, type FormState } from "@/lib/form";
import { notifyClient } from "@/lib/notifications";
import { requireArtist } from "@/lib/session";
import { isRequestStatus } from "@/lib/status";
import { paymentSchema, quoteSchema } from "@/lib/validation/dashboard-request";

// Each action starts with requireArtist(). The request id comes from the
// browser, the artist id never does.

function refresh(requestId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/requests/${requestId}`);
}

// Used by the board and by the buttons on the request page. The target
// status is the value of the select or of the button that was clicked.
export async function move(
  requestId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const artist = await requireArtist();

  const to = text(formData, "to");
  if (!isRequestStatus(to)) {
    return { message: "Choose where to move the request." };
  }

  const result = await moveRequest(artist.id, requestId, to);
  if (!result.ok) return { message: result.error };

  // every status change is emailed to the client
  await notifyClient(requestId);

  refresh(requestId);
  return { ok: true };
}

export async function quote(
  requestId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const artist = await requireArtist();

  const values = { price: text(formData, "price"), message: text(formData, "message") };
  const parsed = quoteSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const result = await sendQuote(artist.id, requestId, parsed.data);
  if (!result.ok) return { message: result.error, values };

  await notifyClient(requestId);

  refresh(requestId);
  return { ok: true, message: "Quote sent." };
}

export async function recordPayment(
  requestId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const artist = await requireArtist();

  const values = {
    kind: text(formData, "kind"),
    amount: text(formData, "amount"),
    paid: text(formData, "paid"),
    note: text(formData, "note"),
  };
  const parsed = paymentSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const result = await addPayment(artist.id, requestId, parsed.data);
  if (!result.ok) return { message: result.error, values };

  refresh(requestId);
  return { ok: true, message: "Payment recorded." };
}

export async function markPayment(requestId: string, paymentId: string, paid: boolean) {
  const artist = await requireArtist();
  await setPaymentPaid(artist.id, paymentId, paid);
  refresh(requestId);
}

export async function removePayment(requestId: string, paymentId: string) {
  const artist = await requireArtist();
  await deletePayment(artist.id, paymentId);
  refresh(requestId);
}
