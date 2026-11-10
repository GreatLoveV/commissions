import Link from "next/link";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/styles";
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
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 pt-3 pb-2 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <Logo href="/dashboard" />
            <div className="flex items-center gap-1">
              <Link href={`/${artist.handle}`} className={buttonClass("ghost", "sm")}>
                View your page
              </Link>
              <form action={logout}>
                <button type="submit" className={buttonClass("ghost", "sm")}>
                  Log out
                </button>
              </form>
            </div>
          </div>
          <NavLinks />
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
