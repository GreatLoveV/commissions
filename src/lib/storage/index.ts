import type { ImageInfo } from "@/lib/image-info";
import { cloudinaryStorage } from "./cloudinary";
import { localStorage } from "./local";

// Where uploaded images live. The rest of the app only sees this
// interface, so swapping Cloudinary for something else later means
// writing one new file.
export type StoredImage = { key: string; width: number; height: number };

export type ImageStorage = {
  // folder groups files per artist, e.g. "portfolio/<artistId>"
  save(folder: string, bytes: Buffer, info: ImageInfo): Promise<StoredImage>;
  delete(key: string): Promise<void>;
  // url to use in an <Image> for a stored key
  url(key: string): string;
};

export function usesCloudinary() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function pickStorage(): ImageStorage {
  if (usesCloudinary()) return cloudinaryStorage;
  // The local folder is for development only. A serverless host throws
  // files away between requests.
  if (process.env.NODE_ENV === "production") {
    throw new Error("Image storage is not configured. Set the CLOUDINARY_* variables.");
  }
  return localStorage;
}

export const storage: ImageStorage = {
  save: (folder, bytes, info) => pickStorage().save(folder, bytes, info),
  delete: (key) => pickStorage().delete(key),
  url: (key) => pickStorage().url(key),
};
