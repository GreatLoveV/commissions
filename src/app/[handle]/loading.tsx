import { Skeleton } from "@/components/ui/states";

// Shown while an artist's page loads.
export default function ArtistLoading() {
  return (
    <main id="main" tabIndex={-1} aria-busy="true" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:py-16">
      <p role="status" className="sr-only">
        Loading…
      </p>
      <Skeleton className="h-16 w-2/3 max-w-lg" />
      <Skeleton className="mt-5 h-10 w-56" />
      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-panel" />
      </div>
    </main>
  );
}
