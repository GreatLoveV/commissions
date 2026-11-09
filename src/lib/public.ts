import { cache } from "react";
import { prisma } from "@/lib/db";

// Queries for pages that anyone can open without logging in.
// Each one lists the columns it returns with `select`, so private fields
// (user id, timestamps, hidden types) can never leak into a public page.

export const getPublicArtist = cache(async (handle: string) => {
  return prisma.artist.findUnique({
    where: { handle },
    select: {
      handle: true,
      displayName: true,
      bio: true,
      slotsOpen: true,
      currency: true,
      commissionTypes: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
          description: true,
          basePriceMinor: true,
          turnaroundDays: true,
        },
      },
      portfolioImages: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          storageKey: true,
          width: true,
          height: true,
          alt: true,
        },
      },
    },
  });
});
