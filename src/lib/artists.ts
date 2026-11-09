import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import type { OnboardingInput, ProfileInput } from "@/lib/validation/artist";

// The artists table is the tenant table itself, so it is not behind
// tenantDb(). Every function here takes the id it is allowed to touch.

type SaveResult = { ok: true } | { ok: false; error: "handle_taken" };

function isUniqueError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export function getArtistByUserId(userId: string) {
  return prisma.artist.findUnique({ where: { userId } });
}

export async function createArtist(
  userId: string,
  input: OnboardingInput,
): Promise<SaveResult> {
  const taken = await prisma.artist.findUnique({
    where: { handle: input.handle },
    select: { id: true },
  });
  if (taken) return { ok: false, error: "handle_taken" };

  try {
    await prisma.artist.create({ data: { userId, ...input } });
    return { ok: true };
  } catch (error) {
    // two signups can race for the same handle, the unique index decides
    if (isUniqueError(error)) return { ok: false, error: "handle_taken" };
    throw error;
  }
}

export async function updateArtist(
  artistId: string,
  input: ProfileInput,
): Promise<SaveResult> {
  try {
    await prisma.artist.update({ where: { id: artistId }, data: input });
    return { ok: true };
  } catch (error) {
    if (isUniqueError(error)) return { ok: false, error: "handle_taken" };
    throw error;
  }
}

export async function setSlotsOpen(artistId: string, slotsOpen: boolean) {
  await prisma.artist.update({ where: { id: artistId }, data: { slotsOpen } });
}
