"use client";

import { buttonPrimary } from "@/components/styles";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold">This page could not load</h1>
      <p className="text-muted">
        Nothing was changed. Try again, and if it keeps failing check that the
        database is running.
      </p>
      <button
        type="button"
        onClick={reset}
        className={buttonPrimary}
      >
        Try again
      </button>
    </div>
  );
}
