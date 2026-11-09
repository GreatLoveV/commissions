"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { text, type FormState } from "@/lib/form";
import { requireArtist } from "@/lib/session";
import { tenantDb } from "@/lib/tenant";
import {
  commissionTypeSchema,
  MAX_TYPES_PER_ARTIST,
} from "@/lib/validation/commission-type";

function readForm(formData: FormData) {
  return {
    name: text(formData, "name"),
    description: text(formData, "description"),
    basePrice: text(formData, "basePrice"),
    turnaroundDays: text(formData, "turnaroundDays"),
  };
}

// The public page shows the types too, so it has to be refreshed as well.
function refresh(handle: string) {
  revalidatePath("/dashboard/types");
  revalidatePath(`/${handle}`);
}

export async function createType(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const artist = await requireArtist();
  const db = tenantDb(artist.id);

  const values = readForm(formData);
  const parsed = commissionTypeSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  if ((await db.commissionType.count()) >= MAX_TYPES_PER_ARTIST) {
    return {
      message: `You can have up to ${MAX_TYPES_PER_ARTIST} commission types. Delete one first.`,
      values,
    };
  }

  const { basePrice, ...rest } = parsed.data;
  await db.commissionType.create({
    data: { ...rest, basePriceMinor: basePrice, artistId: artist.id },
  });

  refresh(artist.handle);
  redirect("/dashboard/types");
}

export async function updateType(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const artist = await requireArtist();
  const db = tenantDb(artist.id);

  const values = readForm(formData);
  const parsed = commissionTypeSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  // updateMany does not throw when nothing matches. A count of 0 means the
  // id does not exist or belongs to another artist.
  const { basePrice, ...rest } = parsed.data;
  const result = await db.commissionType.updateMany({
    where: { id },
    data: { ...rest, basePriceMinor: basePrice },
  });
  if (result.count === 0) {
    return { message: "This commission type no longer exists.", values };
  }

  refresh(artist.handle);
  redirect("/dashboard/types");
}

export async function setTypeActive(id: string, isActive: boolean) {
  const artist = await requireArtist();
  await tenantDb(artist.id).commissionType.updateMany({
    where: { id },
    data: { isActive },
  });
  refresh(artist.handle);
}

export async function deleteType(id: string): Promise<FormState> {
  const artist = await requireArtist();
  const db = tenantDb(artist.id);

  // Requests keep pointing at their type, so a type that has been used
  // can only be hidden. The database also enforces this.
  const used = await db.request.count({ where: { commissionTypeId: id } });
  if (used > 0) {
    return {
      message:
        "Clients have already requested this type, so it cannot be deleted. Hide it from your page instead.",
    };
  }

  await db.commissionType.deleteMany({ where: { id } });
  refresh(artist.handle);
  redirect("/dashboard/types");
}
