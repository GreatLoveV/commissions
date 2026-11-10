import { Skeleton } from "@/components/ui/states";

// Shown while a dashboard page loads: grey shapes where the content will be.
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <p role="status" className="sr-only">
        Loading…
      </p>
      <Skeleton className="h-24 w-full rounded-panel" />
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((column) => (
          <div key={column} className="flex flex-col gap-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-32 w-full rounded-panel" />
            <Skeleton className="h-24 w-full rounded-panel" />
          </div>
        ))}
      </div>
    </div>
  );
}
