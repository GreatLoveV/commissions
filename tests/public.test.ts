import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { getPublicArtist } from "@/lib/public";
import { readLocalFile } from "@/lib/storage/local";
import { makeArtist, makeType, resetDb } from "./helpers";

beforeEach(resetDb);

describe("public artist page data", () => {
  it("returns only public fields", async () => {
    await makeArtist("alice");
    const artist = await getPublicArtist("alice");
    expect(Object.keys(artist ?? {}).sort()).toEqual([
      "bio",
      "commissionTypes",
      "currency",
      "displayName",
      "handle",
      "portfolioImages",
      "slotsOpen",
    ]);
  });

  it("leaves out hidden commission types", async () => {
    const alice = await makeArtist("alice");
    await makeType(alice.id, "Shown");
    const hidden = await makeType(alice.id, "Hidden");
    await prisma.commissionType.update({
      where: { id: hidden.id },
      data: { isActive: false },
    });

    const artist = await getPublicArtist("alice");
    expect(artist?.commissionTypes.map((t) => t.name)).toEqual(["Shown"]);
  });

  it("does not mix in another artist's types", async () => {
    const alice = await makeArtist("alice");
    const bob = await makeArtist("bob");
    await makeType(alice.id, "Alice portrait");
    await makeType(bob.id, "Bob portrait");

    const artist = await getPublicArtist("bob");
    expect(artist?.commissionTypes.map((t) => t.name)).toEqual(["Bob portrait"]);
  });

  it("returns null for an unknown handle", async () => {
    expect(await getPublicArtist("nobody")).toBeNull();
  });
});

describe("local file storage keys", () => {
  it.each([
    "../.env",
    "portfolio/../../.env",
    "portfolio/abc/../../../package.json",
    "/etc/passwd",
    "portfolio/abc/file.svg",
    "portfolio\\abc\\file.png",
    "portfolio/abc/file.png/../../x.png",
    "",
  ])("refuses %s", async (key) => {
    expect(await readLocalFile(key)).toBeNull();
  });
});
