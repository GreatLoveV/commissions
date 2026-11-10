import Link from "next/link";
import { requireArtist } from "@/lib/session";
import { logout } from "./actions";
import { NavLinks } from "./nav-links";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This only decides what the header shows. Each page and action below
  // calls requireArtist() again for itself.
  const artist = await requireArtist();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line bg-sheet">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
          <p className="font-display text-lg font-semibold">
            {artist.displayName}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href={`/${artist.handle}`}
              className="text-muted underline underline-offset-2 hover:text-ink"
            >
              View public page
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-muted underline underline-offset-2 hover:text-ink"
              >
                Log out
              </button>
            </form>
          </div>
          <NavLinks />
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
