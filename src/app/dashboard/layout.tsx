import Link from "next/link";
import { requireArtist } from "@/lib/session";
import { logout } from "./actions";

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
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
          <nav aria-label="Dashboard" className="flex items-center gap-4">
            <Link href="/dashboard" className="font-semibold">
              {artist.displayName}
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              Settings
            </Link>
          </nav>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-neutral-600 underline hover:text-neutral-900"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
