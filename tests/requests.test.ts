import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { readImageInfo } from "@/lib/image-info";
import {
  addReferenceFile,
  createClientRequest,
  getRequestByToken,
  MAX_REFERENCE_FILES,
  removeReferenceFile,
} from "@/lib/requests";
import { readLocalFile } from "@/lib/storage/local";
import { hashToken } from "@/lib/tokens";
import { makeArtist, makeType, pngBytes, resetDb } from "./helpers";

const input = {
  clientName: "Sam Client",
  clientEmail: "sam@example.com",
  description: "A portrait of my cat wearing a tiny crown.",
  usage: "PERSONAL" as const,
  deadline: null,
};

function image() {
  const bytes = Buffer.from(pngBytes(120, 80));
  const info = readImageInfo(bytes);
  if (!info) throw new Error("test image is broken");
  return { bytes, info };
}

// An artist who is open for commissions, with one commission type.
async function openArtist(handle: string) {
  const artist = await makeArtist(handle);
  await prisma.artist.update({ where: { id: artist.id }, data: { slotsOpen: true } });
  const type = await makeType(artist.id, `${handle} portrait`);
  return { artist, type };
}

async function sendRequest(handle: string, typeId: string) {
  const result = await createClientRequest(handle, typeId, input);
  if (!result.ok) throw new Error(`request failed: ${result.reason}`);
  return result.token;
}

beforeEach(resetDb);

describe("sending a request", () => {
  it("creates the request for the artist in the url", async () => {
    const { artist, type } = await openArtist("alice");
    await openArtist("bob");

    await sendRequest("alice", type.id);

    const requests = await prisma.request.findMany();
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      artistId: artist.id,
      commissionTypeId: type.id,
      status: "REQUESTED",
      clientEmail: "sam@example.com",
    });
  });

  it("copies the type name, price and currency onto the request", async () => {
    const { type } = await openArtist("alice");
    await sendRequest("alice", type.id);

    // the artist changes the type afterwards
    await prisma.commissionType.update({
      where: { id: type.id },
      data: { name: "Renamed", basePriceMinor: 99999 },
    });

    const request = await prisma.request.findFirstOrThrow();
    expect(request).toMatchObject({
      typeNameSnapshot: "alice portrait",
      basePriceMinorSnapshot: 5000,
      currency: "USD",
    });
  });

  it("stores only the hash of the private link token", async () => {
    const { type } = await openArtist("alice");
    const token = await sendRequest("alice", type.id);

    const request = await prisma.request.findFirstOrThrow();
    expect(request.trackingTokenHash).toBe(hashToken(token));
    expect(JSON.stringify(request)).not.toContain(token);
  });

  it("writes the first history entry", async () => {
    const { artist, type } = await openArtist("alice");
    await sendRequest("alice", type.id);

    const events = await prisma.requestEvent.findMany();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      artistId: artist.id,
      type: "CREATED",
      actor: "CLIENT",
      toStatus: "REQUESTED",
    });
  });

  it("refuses when the artist is closed", async () => {
    const { artist, type } = await openArtist("alice");
    await prisma.artist.update({ where: { id: artist.id }, data: { slotsOpen: false } });

    expect(await createClientRequest("alice", type.id, input)).toEqual({
      ok: false,
      reason: "closed",
    });
    expect(await prisma.request.count()).toBe(0);
  });

  it("refuses another artist's commission type", async () => {
    await openArtist("alice");
    const bob = await openArtist("bob");

    expect(await createClientRequest("alice", bob.type.id, input)).toEqual({
      ok: false,
      reason: "not_found",
    });
    expect(await prisma.request.count()).toBe(0);
  });

  it("refuses a hidden commission type", async () => {
    const { type } = await openArtist("alice");
    await prisma.commissionType.update({ where: { id: type.id }, data: { isActive: false } });

    const result = await createClientRequest("alice", type.id, input);
    expect(result).toEqual({ ok: false, reason: "not_found" });
  });

  it("refuses an unknown artist", async () => {
    const { type } = await openArtist("alice");
    const result = await createClientRequest("nobody", type.id, input);
    expect(result).toEqual({ ok: false, reason: "not_found" });
  });
});

describe("private request link", () => {
  it("finds the request with the right token only", async () => {
    const { type } = await openArtist("alice");
    const token = await sendRequest("alice", type.id);

    expect((await getRequestByToken(token))?.clientName).toBe("Sam Client");
    // same length, different token
    const other = token.startsWith("A") ? `B${token.slice(1)}` : `A${token.slice(1)}`;
    expect(await getRequestByToken(other)).toBeNull();
  });

  it.each(["", "short", "../../etc/passwd", "a".repeat(44), "a b".repeat(15)])(
    "rejects the malformed token %j",
    async (token) => {
      expect(await getRequestByToken(token)).toBeNull();
    },
  );

  it("does not return the client's email or the token hash", async () => {
    const { type } = await openArtist("alice");
    const token = await sendRequest("alice", type.id);
    const request = await getRequestByToken(token);
    expect(JSON.stringify(request)).not.toContain("sam@example.com");
    expect(request).not.toHaveProperty("trackingTokenHash");
  });
});

describe("reference images", () => {
  it("saves a file under the request's own folder", async () => {
    const { artist, type } = await openArtist("alice");
    const token = await sendRequest("alice", type.id);

    expect(await addReferenceFile(token, image(), "my cat.png")).toEqual({ ok: true });

    const request = await prisma.request.findFirstOrThrow();
    const file = await prisma.requestFile.findFirstOrThrow();
    expect(file.artistId).toBe(artist.id);
    expect(file.requestId).toBe(request.id);
    expect(file.storageKey.startsWith(`references/${artist.id}/${request.id}/`)).toBe(true);
    expect(file.mimeType).toBe("image/png");
    expect(await readLocalFile(file.storageKey)).not.toBeNull();
  });

  it("cleans up the file name", async () => {
    const { type } = await openArtist("alice");
    const token = await sendRequest("alice", type.id);
    await addReferenceFile(token, image(), '../../<script>"evil".png');

    const file = await prisma.requestFile.findFirstOrThrow();
    expect(file.originalName).not.toMatch(/[<>"/\\]/);
  });

  it(`stops at ${MAX_REFERENCE_FILES} files`, async () => {
    const { type } = await openArtist("alice");
    const token = await sendRequest("alice", type.id);

    for (let i = 0; i < MAX_REFERENCE_FILES; i++) {
      expect((await addReferenceFile(token, image(), "a.png")).ok).toBe(true);
    }
    expect((await addReferenceFile(token, image(), "a.png")).ok).toBe(false);
    expect(await prisma.requestFile.count()).toBe(MAX_REFERENCE_FILES);
  });

  it("is locked once the artist has replied", async () => {
    const { type } = await openArtist("alice");
    const token = await sendRequest("alice", type.id);
    await addReferenceFile(token, image(), "a.png");
    const file = await prisma.requestFile.findFirstOrThrow();

    await prisma.request.updateMany({ data: { status: "QUOTED" } });

    expect((await addReferenceFile(token, image(), "b.png")).ok).toBe(false);
    expect((await removeReferenceFile(token, file.id)).ok).toBe(false);
    expect(await prisma.requestFile.count()).toBe(1);
  });

  it("refuses an unknown token", async () => {
    const result = await addReferenceFile("x".repeat(43), image(), "a.png");
    expect(result.ok).toBe(false);
  });

  it("removes a file and deletes it from storage", async () => {
    const { type } = await openArtist("alice");
    const token = await sendRequest("alice", type.id);
    await addReferenceFile(token, image(), "a.png");
    const file = await prisma.requestFile.findFirstOrThrow();

    await removeReferenceFile(token, file.id);

    expect(await prisma.requestFile.count()).toBe(0);
    expect(await readLocalFile(file.storageKey)).toBeNull();
  });

  it("cannot remove a file from someone else's request", async () => {
    const alice = await openArtist("alice");
    const bob = await openArtist("bob");
    const aliceToken = await sendRequest("alice", alice.type.id);
    const bobToken = await sendRequest("bob", bob.type.id);
    await addReferenceFile(bobToken, image(), "bob.png");
    const bobFile = await prisma.requestFile.findFirstOrThrow();

    // a second request to the same artist must not reach it either
    const secondToken = await sendRequest("bob", bob.type.id);

    await removeReferenceFile(aliceToken, bobFile.id);
    await removeReferenceFile(secondToken, bobFile.id);

    expect(await prisma.requestFile.count()).toBe(1);
    expect(await readLocalFile(bobFile.storageKey)).not.toBeNull();
  });
});
