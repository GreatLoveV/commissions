"use server";

import { revalidatePath } from "next/cache";
import { text, type FormState } from "@/lib/form";
import { requireArtist } from "@/lib/session";
import { storage } from "@/lib/storage";
import { tenantDb } from "@/lib/tenant";
import { checkImageUpload } from "@/lib/uploads";

const MAX_PORTFOLIO_IMAGES = 12;
const MAX_ALT_LENGTH = 200;

function refresh(handle: string) {
  revalidatePath("/dashboard/portfolio");
  revalidatePath(`/${handle}`);
}

export async function uploadPortfolioImage(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const artist = await requireArtist();
  const db = tenantDb(artist.id);

  const alt = text(formData, "alt").trim();
  const values = { alt };
  if (alt.length > MAX_ALT_LENGTH) {
    return { errors: { alt: [`Use at most ${MAX_ALT_LENGTH} characters`] }, values };
  }

  const count = await db.portfolioImage.count();
  if (count >= MAX_PORTFOLIO_IMAGES) {
    return {
      message: `Your portfolio is full (${MAX_PORTFOLIO_IMAGES} images). Remove one first.`,
      values,
    };
  }

  const checked = await checkImageUpload(formData.get("image"));
  if (!checked.ok) {
    return { errors: { image: [checked.error] }, values };
  }

  // The folder comes from the session, so an artist can only ever write
  // into their own folder.
  const stored = await storage.save(
    `portfolio/${artist.id}`,
    checked.bytes,
    checked.info,
  );

  try {
    await db.portfolioImage.create({
      data: {
        artistId: artist.id,
        storageKey: stored.key,
        width: stored.width,
        height: stored.height,
        alt,
        sortOrder: count,
      },
    });
  } catch (error) {
    // do not leave a file behind that no row points to
    await storage.delete(stored.key);
    throw error;
  }

  refresh(artist.handle);
  return { ok: true, message: "Image added." };
}

export async function deletePortfolioImage(id: string) {
  const artist = await requireArtist();
  const db = tenantDb(artist.id);

  // Look the row up through tenantDb first. The storage key is read from
  // the artist's own row, never taken from the request.
  const image = await db.portfolioImage.findUnique({ where: { id } });
  if (!image) return;

  await db.portfolioImage.deleteMany({ where: { id } });
  await storage.delete(image.storageKey);
  refresh(artist.handle);
}
