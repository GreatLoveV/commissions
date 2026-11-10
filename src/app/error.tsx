"use client";

import { Logo } from "@/components/logo";
import { ErrorState } from "@/components/ui/states";

// Shown when a page throws an error that nothing closer caught.
// The dashboard has its own version that keeps the navigation visible.
export default function AppError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <Logo />
      </header>
      <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-16">
        <ErrorState title="This page could not load" onRetry={reset}>
          Something went wrong on our side and nothing was saved. Try again in
          a moment.
        </ErrorState>
      </main>
    </div>
  );
}
