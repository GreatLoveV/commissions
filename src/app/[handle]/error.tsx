"use client";

import { buttonPrimary } from "@/components/styles";

export default function ArtistError({ reset }: { reset: () => void }) {
  return (
    <main
      role="alert"
      className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-4 px-4 py-16"
    >
      <h1 className="text-3xl font-semibold">This page could not load</h1>
      <p className="text-muted">
        Something went wrong on our side. Try again in a moment.
      </p>
      <button type="button" onClick={reset} className={buttonPrimary}>
        Try again
      </button>
    </main>
  );
}
