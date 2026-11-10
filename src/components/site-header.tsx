import Link from "next/link";
import { buttonClass } from "@/components/styles";
import { Logo } from "./logo";

// Header for the pages outside the dashboard. It does not read the
// session, so these pages can stay static: someone already logged in who
// clicks "Log in" is sent straight to their dashboard.
export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <Logo />
      <nav aria-label="Account" className="flex items-center gap-1 sm:gap-2">
        <Link href="/login" className={buttonClass("ghost", "sm")}>
          Log in
        </Link>
        <Link href="/signup" className={buttonClass("ink", "sm")}>
          Sign up free
        </Link>
      </nav>
    </header>
  );
}
