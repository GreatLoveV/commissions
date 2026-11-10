import Link from "next/link";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/styles";
import { BlankSheet } from "@/components/ui/doodles";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <Logo />
      </header>
      <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-5 px-4 py-16">
        <BlankSheet className="w-32" />
        <h1 className="text-4xl">Nothing at this address</h1>
        <p className="text-lg text-muted">
          There is no page or artist here. If you followed a link to an artist,
          they may have changed their handle.
        </p>
        <Link href="/" className={buttonClass("primary")}>
          Go to the home page
        </Link>
      </main>
    </div>
  );
}
