import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { tenantDb } from "@/lib/tenant";
import { makeArtist, makeRequest, makeType, resetDb } from "./helpers";

// Two artists, each with one commission type and one request.
async function setup() {
  const alice = await makeArtist("alice");
  const bob = await makeArtist("bob");
  const aliceType = await makeType(alice.id, "Alice portrait");
  const bobType = await makeType(bob.id, "Bob portrait");
  const aliceRequest = await makeRequest(alice.id, aliceType.id);
  const bobRequest = await makeRequest(bob.id, bobType.id);
  return { alice, bob, aliceType, bobType, aliceRequest, bobRequest };
}

beforeEach(resetDb);

describe("tenantDb reads", () => {
  it("only lists the artist's own rows", async () => {
    const { alice } = await setup();
    const types = await tenantDb(alice.id).commissionType.findMany();
    expect(types.map((t) => t.name)).toEqual(["Alice portrait"]);
  });

  it("cannot fetch another artist's row by id", async () => {
    const { alice, bobType, bobRequest } = await setup();
    const db = tenantDb(alice.id);
    expect(await db.commissionType.findUnique({ where: { id: bobType.id } })).toBeNull();
    expect(await db.request.findFirst({ where: { id: bobRequest.id } })).toBeNull();
  });

  it("ignores an artistId passed by the caller", async () => {
    const { alice, bob } = await setup();
    const types = await tenantDb(alice.id).commissionType.findMany({
      where: { artistId: bob.id },
    });
    expect(types.map((t) => t.name)).toEqual(["Alice portrait"]);
  });

  it("counts only the artist's own rows", async () => {
    const { alice } = await setup();
    expect(await tenantDb(alice.id).request.count()).toBe(1);
  });
});

describe("tenantDb writes", () => {
  it("cannot update another artist's row", async () => {
    const { alice, bobType } = await setup();
    const db = tenantDb(alice.id);

    await expect(
      db.commissionType.update({ where: { id: bobType.id }, data: { name: "hacked" } }),
    ).rejects.toThrow();
    const many = await db.commissionType.updateMany({
      where: { id: bobType.id },
      data: { name: "hacked" },
    });
    expect(many.count).toBe(0);

    const after = await prisma.commissionType.findUnique({ where: { id: bobType.id } });
    expect(after?.name).toBe("Bob portrait");
  });

  it("cannot delete another artist's row", async () => {
    const { alice, bobRequest } = await setup();
    const db = tenantDb(alice.id);

    await expect(db.request.delete({ where: { id: bobRequest.id } })).rejects.toThrow();
    expect((await db.request.deleteMany({ where: { id: bobRequest.id } })).count).toBe(0);
    expect(await prisma.request.count()).toBe(2);
  });

  it("creates rows for the artist even if the caller passes another id", async () => {
    const { alice, bob } = await setup();
    const created = await tenantDb(alice.id).commissionType.create({
      data: { artistId: bob.id, name: "Sneaky", basePriceMinor: 100, turnaroundDays: 1 },
    });
    expect(created.artistId).toBe(alice.id);
  });

  it("cannot move a row to another artist", async () => {
    const { alice, bob } = await setup();
    const db = tenantDb(alice.id);
    const mine = await db.commissionType.create({
      data: { artistId: alice.id, name: "Mine", basePriceMinor: 100, turnaroundDays: 1 },
    });
    const updated = await db.commissionType.update({
      where: { id: mine.id },
      data: { artistId: bob.id, name: "Still mine" },
    });
    expect(updated.artistId).toBe(alice.id);
  });

  it("blocks operations that are not scoped", async () => {
    const { alice, aliceType } = await setup();
    const db = tenantDb(alice.id);
    await expect(
      db.commissionType.upsert({
        where: { id: aliceType.id },
        create: { artistId: alice.id, name: "x", basePriceMinor: 1, turnaroundDays: 1 },
        update: { name: "x" },
      }),
    ).rejects.toThrow("not allowed through tenantDb");
  });

  it("does not expose tables outside the tenant", async () => {
    const { alice } = await setup();
    const db = tenantDb(alice.id);
    expect("user" in db).toBe(false);
    expect("artist" in db).toBe(false);
    expect(() => tenantDb("")).toThrow();
  });
});

// These go around tenantDb on purpose, to prove the database itself
// refuses mixed up rows even when the app code is wrong.
describe("database foreign keys", () => {
  it("rejects a file that points at another artist's request", async () => {
    const { bob, aliceRequest } = await setup();
    await expect(
      prisma.requestFile.create({
        data: {
          artistId: bob.id,
          requestId: aliceRequest.id,
          storageKey: "k",
          mimeType: "image/png",
          sizeBytes: 1,
          originalName: "a.png",
        },
      }),
    ).rejects.toThrow();
  });

  it("rejects a request that uses another artist's commission type", async () => {
    const { alice, bobType } = await setup();
    await expect(makeRequest(alice.id, bobType.id)).rejects.toThrow();
  });

  it("rejects a payment that points at another artist's request", async () => {
    const { bob, aliceRequest } = await setup();
    await expect(
      prisma.payment.create({
        data: {
          artistId: bob.id,
          requestId: aliceRequest.id,
          kind: "DEPOSIT",
          amountMinor: 1000,
          currency: "USD",
        },
      }),
    ).rejects.toThrow();
  });

  it("does not let a commission type with requests be deleted", async () => {
    const { aliceType } = await setup();
    await expect(
      prisma.commissionType.delete({ where: { id: aliceType.id } }),
    ).rejects.toThrow();
  });

  it("deleting an artist removes their rows and nobody else's", async () => {
    const { alice } = await setup();
    await prisma.artist.delete({ where: { id: alice.id } });
    expect(await prisma.commissionType.count()).toBe(1);
    expect(await prisma.request.count()).toBe(1);
  });
});
