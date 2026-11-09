import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getArtistByUserId } from "@/lib/artists";

// cache() makes these run once per request even if a layout, a page and
// a component all call them.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export const getCurrentArtist = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  return getArtistByUserId(session.user.id);
});

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}

// Call this at the top of every dashboard page and every server action.
// A check in the layout alone is not enough: server actions are public
// endpoints and layouts do not rerun on every navigation.
export async function requireArtist() {
  await requireUser();
  const artist = await getCurrentArtist();
  if (!artist) redirect("/onboarding");
  return artist;
}
