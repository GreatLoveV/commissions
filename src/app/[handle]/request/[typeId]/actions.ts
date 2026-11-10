"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { text, type FormState } from "@/lib/form";
import { clientIp, limits, rateLimitAll } from "@/lib/rate-limit";
import { createClientRequest } from "@/lib/requests";
import { requestSchema } from "@/lib/validation/request";

// Anyone can call this action, with any handle and type id.
// Nothing here is trusted: the artist and the type are looked up again on
// the server inside createClientRequest.
export async function sendRequest(
  handle: string,
  typeId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = {
    clientName: text(formData, "clientName"),
    clientEmail: text(formData, "clientEmail"),
    description: text(formData, "description"),
    usage: text(formData, "usage"),
    deadline: text(formData, "deadline"),
  };

  // Honeypot: real visitors never see this field, simple bots fill in
  // everything. Answer as if it worked so the bot learns nothing.
  if (text(formData, "website") !== "") {
    return { ok: true, message: "Your request was sent." };
  }

  const parsed = requestSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  if (!(await rateLimitAll(limits.sendRequest(await clientIp(), handle)))) {
    return {
      message: "Too many requests were sent from here. Try again in an hour.",
      values,
    };
  }

  const result = await createClientRequest(handle, typeId, parsed.data);
  if (!result.ok) {
    return {
      message:
        result.reason === "closed"
          ? "This artist has just closed commissions, so the request was not sent."
          : "This commission type is no longer available.",
      values,
    };
  }

  revalidatePath("/dashboard");
  redirect(`/r/${result.token}/references`);
}
