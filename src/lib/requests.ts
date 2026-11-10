import { cache } from "react";
import { prisma } from "@/lib/db";
import type { ImageInfo } from "@/lib/image-info";
import { storage } from "@/lib/storage";
import { tenantDb } from "@/lib/tenant";
import { createTrackingToken, hashToken, looksLikeToken } from "@/lib/tokens";
import type { RequestInput } from "@/lib/validation/request";

// Everything a client (someone without an account) can do with a request.
// A client is identified in one of two ways:
// - when sending a request: by the artist handle in the url
// - afterwards: by the private token in their link
// In both cases the artist id is looked up on the server and every write
// goes through tenantDb, the same as in the dashboard.

export const MAX_REFERENCE_FILES = 5;

type CreateResult =
  | { ok: true; token: string }
  | { ok: false; reason: "not_found" | "closed" };

export async function createClientRequest(
  handle: string,
  typeId: string,
  input: RequestInput,
): Promise<CreateResult> {
  const artist = await prisma.artist.findUnique({
    where: { handle },
    select: { id: true, slotsOpen: true, currency: true },
  });
  if (!artist) return { ok: false, reason: "not_found" };

  // Scoped lookup: a type id that belongs to a different artist is simply
  // not found here.
  const db = tenantDb(artist.id);
  const type = await db.commissionType.findFirst({
    where: { id: typeId, isActive: true },
  });
  if (!type) return { ok: false, reason: "not_found" };

  // Checked again on the server. The page hides the form when the artist
  // is closed, but the form could have been open in a tab for hours.
  if (!artist.slotsOpen) return { ok: false, reason: "closed" };

  const { token, hash } = createTrackingToken();
  await db.request.create({
    data: {
      artistId: artist.id,
      commissionTypeId: type.id,
      // copies, so later edits to the type do not change this request
      typeNameSnapshot: type.name,
      basePriceMinorSnapshot: type.basePriceMinor,
      currency: artist.currency,
      ...input,
      trackingTokenHash: hash,
      // first entry of the request's history, saved in the same query
      events: {
        create: [{ type: "CREATED", actor: "CLIENT", toStatus: "REQUESTED" }],
      },
    },
  });

  return { ok: true, token };
}

// Finds a request from the token in a private link. Returns only what the
// client's own pages show.
export const getRequestByToken = cache(async (token: string) => {
  if (!looksLikeToken(token)) return null;

  return prisma.request.findUnique({
    where: { trackingTokenHash: hashToken(token) },
    select: {
      id: true,
      artistId: true,
      status: true,
      typeNameSnapshot: true,
      clientName: true,
      description: true,
      usage: true,
      deadline: true,
      createdAt: true,
      artist: { select: { displayName: true, handle: true } },
      files: {
        orderBy: { createdAt: "asc" },
        select: { id: true, storageKey: true, originalName: true },
      },
    },
  });
});

type ReferenceResult = { ok: true } | { ok: false; error: string };

const LOCKED =
  "The artist has already replied to this request, so its reference images can no longer be changed.";

export async function addReferenceFile(
  token: string,
  image: { bytes: Buffer; info: ImageInfo },
  originalName: string,
): Promise<ReferenceResult> {
  const request = await getRequestByToken(token);
  if (!request) return { ok: false, error: "This request link is not valid." };
  if (request.status !== "REQUESTED") return { ok: false, error: LOCKED };
  if (request.files.length >= MAX_REFERENCE_FILES) {
    return {
      ok: false,
      error: `A request can have up to ${MAX_REFERENCE_FILES} reference images.`,
    };
  }

  const stored = await storage.save(
    `references/${request.artistId}/${request.id}`,
    image.bytes,
    image.info,
  );

  try {
    await tenantDb(request.artistId).requestFile.create({
      data: {
        artistId: request.artistId,
        requestId: request.id,
        storageKey: stored.key,
        mimeType: image.info.mime,
        sizeBytes: image.bytes.length,
        originalName: cleanFileName(originalName),
      },
    });
  } catch (error) {
    await storage.delete(stored.key);
    throw error;
  }
  return { ok: true };
}

export async function removeReferenceFile(
  token: string,
  fileId: string,
): Promise<ReferenceResult> {
  const request = await getRequestByToken(token);
  if (!request) return { ok: false, error: "This request link is not valid." };
  if (request.status !== "REQUESTED") return { ok: false, error: LOCKED };

  // the file has to belong to this request, not just to the same artist
  const file = request.files.find((f) => f.id === fileId);
  if (!file) return { ok: true };

  await tenantDb(request.artistId).requestFile.deleteMany({
    where: { id: file.id, requestId: request.id },
  });
  await storage.delete(file.storageKey);
  return { ok: true };
}

// The name is only shown as a label. Keep it short and free of anything
// that could be mistaken for a path or markup.
function cleanFileName(name: string) {
  const cleaned = name.replace(/[^\w.\- ]+/g, "_").slice(0, 100);
  return cleaned || "image";
}
