import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ImageStorage } from "./index";

// Development storage: files go in the .uploads folder (ignored by git)
// and are served by src/app/uploads/[...path]/route.ts.

// Tests set this so their files land in .uploads/test and can be wiped.
const SUBFOLDER = process.env.LOCAL_UPLOADS_SUBFOLDER === "test" ? "test" : "";

// A key looks like "portfolio/<artist id>/<uuid>.png". Checking every key
// against this pattern is what stops "../" tricks from reaching other files.
const KEY_PATTERN = /^[a-z0-9]+(\/[a-z0-9-]+)+\.(jpg|png|webp)$/;

function filePath(key: string) {
  if (!KEY_PATTERN.test(key)) {
    throw new Error("Invalid storage key");
  }
  // The path always starts with the fixed ".uploads" folder. That keeps
  // the build from packaging the whole project "just in case".
  return path.join(process.cwd(), ".uploads", SUBFOLDER, key);
}

export const localStorage: ImageStorage = {
  async save(folder, bytes, info) {
    const key = `${folder}/${randomUUID()}.${info.ext}`;
    const target = filePath(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
    return { key, width: info.width, height: info.height };
  },

  async delete(key) {
    await rm(filePath(key), { force: true });
  },

  url(key) {
    return `/uploads/${key}`;
  },
};

// Used by the route that serves local files. Returns null for a bad key
// or a missing file.
export async function readLocalFile(key: string) {
  if (!KEY_PATTERN.test(key)) return null;
  try {
    return await readFile(filePath(key));
  } catch {
    return null;
  }
}
