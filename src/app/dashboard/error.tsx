"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold">This page could not load</h1>
      <p className="text-neutral-600">
        Nothing was changed. Try again, and if it keeps failing check that the
        database is running.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700"
      >
        Try again
      </button>
    </div>
  );
}
