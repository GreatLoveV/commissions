import { Skeleton } from "@/components/ui/states";

// Shown inside the private request layout while the request loads.
export default function RequestLoading() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <p role="status" className="sr-only">
        Loading your request…
      </p>
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-56 w-full rounded-panel" />
      <Skeleton className="h-32 w-full rounded-panel" />
    </div>
  );
}
