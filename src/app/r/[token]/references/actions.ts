"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/form";
import { clientIp, limits, rateLimitAll } from "@/lib/rate-limit";
import { addReferenceFile, removeReferenceFile } from "@/lib/requests";
import { checkImageUpload } from "@/lib/uploads";

// The token is the only proof of who is calling. Both actions hand it to
// lib/requests, which looks the request up and refuses unknown tokens.

export async function uploadReference(
  token: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await rateLimitAll(limits.referenceUpload(await clientIp())))) {
    return { message: "Too many uploads from here. Try again in an hour." };
  }

  const file = formData.get("image");
  const checked = await checkImageUpload(file);
  if (!checked.ok) {
    return { errors: { image: [checked.error] } };
  }

  const name = file instanceof File ? file.name : "image";
  const result = await addReferenceFile(token, checked, name);
  if (!result.ok) {
    return { message: result.error };
  }

  revalidatePath(`/r/${token}`, "layout");
  return { ok: true, message: "Reference image added." };
}

export async function removeReference(token: string, fileId: string) {
  await removeReferenceFile(token, fileId);
  revalidatePath(`/r/${token}`, "layout");
}
