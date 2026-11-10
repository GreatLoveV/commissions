"use client";

import { buttonPrimary } from "@/components/styles";

// Shown when a page throws an error that nothing closer caught.
// The dashboard has its own version that keeps the navigation visible.
export default function AppError({ reset }: { reset: () => void }) {
  return (
    <main
      id="main"
      tabIndex={-1}
      role="alert"
      className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-4 px-4 py-16"
    >
      <h1 className="text-3xl font-semibold">This page could not load</h1>
      <p className="text-muted">
        Something went wrong on our side and nothing was saved. Try again in a
        moment.
      </p>
      <button type="button" onClick={reset} className={buttonPrimary}>
        Try again
      </button>
    </main>
  );
}
