"use client";

import { ErrorState } from "@/components/ui/states";

// Keeps the dashboard navigation visible, so the artist can go elsewhere.
export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl">
      <ErrorState title="This page could not load" onRetry={reset}>
        Nothing was changed. Try again, and if it keeps failing check that the
        database is running.
      </ErrorState>
    </div>
  );
}
