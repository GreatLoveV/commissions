import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { assertTestDatabase } from "./global-setup";

export async function resetDb() {
  assertTestDatabase(process.env.DATABASE_URL ?? "");
  // every other table hangs off "user" through foreign keys
  await prisma.$executeRawUnsafe('TRUNCATE "user", "verification" CASCADE');
}

// Creates a user with an artist profile, without going through signup.
export async function makeArtist(handle: string) {
  const user = await prisma.user.create({
    data: { id: randomUUID(), name: handle, email: `${handle}@example.com` },
  });
  return prisma.artist.create({
    data: { userId: user.id, handle, displayName: handle },
  });
}

export function makeType(artistId: string, name: string) {
  return prisma.commissionType.create({
    data: { artistId, name, basePriceMinor: 5000, turnaroundDays: 14 },
  });
}

export function makeRequest(artistId: string, commissionTypeId: string) {
  return prisma.request.create({
    data: {
      artistId,
      commissionTypeId,
      typeNameSnapshot: "Portrait",
      basePriceMinorSnapshot: 5000,
      currency: "USD",
      clientName: "Client",
      clientEmail: "client@example.com",
      description: "A portrait of my cat",
      usage: "PERSONAL",
      trackingTokenHash: randomUUID(),
    },
  });
}
