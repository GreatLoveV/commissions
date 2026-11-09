import { readImageInfo, type ImageInfo } from "@/lib/image-info";

// Vercel rejects request bodies over about 4.5 MB, so 4 MB is the most
// one upload can be.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type CheckedImage =
  | { ok: true; bytes: Buffer; info: ImageInfo }
  | { ok: false; error: string };

// Server side check for any uploaded image. Used for portfolio images and
// (later) for the reference images clients attach to a request.
export async function checkImageUpload(
  file: FormDataEntryValue | null,
): Promise<CheckedImage> {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image to upload." };
  }
  // check the size before reading the file into memory
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "The image is larger than 4 MB." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const info = readImageInfo(bytes);
  if (!info) {
    return { ok: false, error: "Use a JPEG, PNG or WebP image." };
  }
  return { ok: true, bytes, info };
}
