import Link from "next/link";
import { linkClass } from "@/components/styles";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 px-4 py-16">
      <h1 className="text-3xl font-semibold">Nothing at this address</h1>
      <p className="text-muted">
        There is no page or artist here. If you followed a link to an artist,
        they may have changed their handle.
      </p>
      <p>
        <Link href="/" className={linkClass}>
          Go to the home page
        </Link>
      </p>
    </main>
  );
}
