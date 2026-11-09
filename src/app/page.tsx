import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        Keep your art commissions out of your DMs
      </h1>
      <p className="text-lg text-neutral-600">
        One public page for your commission types and prices, a request form
        for clients, and a board that shows where every commission stands.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/signup"
          className="rounded-md bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700"
        >
          Create an artist account
        </Link>
        <Link href="/login" className="px-4 py-2 font-medium underline">
          Log in
        </Link>
      </div>
    </main>
  );
}
