"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createArtist } from "@/lib/artists";
import { text, type FormState } from "@/lib/form";
import { getCurrentArtist, requireUser } from "@/lib/session";
import { onboardingSchema } from "@/lib/validation/artist";

export async function createProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  // one profile per account: if it already exists there is nothing to do
  if (await getCurrentArtist()) redirect("/dashboard");

  const values = {
    handle: text(formData, "handle"),
    displayName: text(formData, "displayName"),
  };
  const parsed = onboardingSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const result = await createArtist(user.id, parsed.data);
  if (!result.ok) {
    return { errors: { handle: ["That handle is already taken"] }, values };
  }

  redirect("/dashboard");
}
