import Link from "next/link";
import { buttonPrimary, linkClass } from "@/components/styles";

export default function HomePage() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        Keep your art commissions out of your DMs
      </h1>
      <p className="text-lg text-muted">
        One public page for your commission types and prices, a request form
        for clients, and a board that shows where every commission stands.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/signup"
          className={buttonPrimary}
        >
          Create an artist account
        </Link>
        <Link href="/login" className={`px-4 py-2 font-medium ${linkClass}`}>
          Log in
        </Link>
      </div>
    </main>
  );
}
