"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { setSlotsOpen, updateArtist } from "@/lib/artists";
import { text, type FormState } from "@/lib/form";
import { requireArtist } from "@/lib/session";
import { profileSchema } from "@/lib/validation/artist";

export async function logout() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}

export async function updateProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // the artist id comes from the session, never from the form
  const artist = await requireArtist();

  const values = {
    handle: text(formData, "handle"),
    displayName: text(formData, "displayName"),
    bio: text(formData, "bio"),
    currency: text(formData, "currency"),
  };
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const result = await updateArtist(artist.id, parsed.data);
  if (!result.ok) {
    return { errors: { handle: ["That handle is already taken"] }, values };
  }

  revalidatePath("/dashboard", "layout");
  // the public page shows the profile, under the old and the new handle
  revalidatePath(`/${artist.handle}`);
  revalidatePath(`/${parsed.data.handle}`);
  return { ok: true, message: "Profile saved.", values: parsed.data };
}

export async function setSlots(open: boolean) {
  const artist = await requireArtist();
  await setSlotsOpen(artist.id, open);
  revalidatePath("/dashboard");
  revalidatePath(`/${artist.handle}`);
}
