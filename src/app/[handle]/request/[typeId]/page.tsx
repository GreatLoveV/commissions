import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { linkClass, sheetClass } from "@/components/styles";
import { EmptyState } from "@/components/ui/states";
import { formatMoney } from "@/lib/money";
import { getPublicArtist } from "@/lib/public";
import { sendRequest } from "./actions";
import { RequestForm } from "./request-form";

type Props = PageProps<"/[handle]/request/[typeId]">;

// getPublicArtist only returns types that are shown on the public page,
// so a hidden type or another artist's type ends in a 404.
async function load(params: Props["params"]) {
  const { handle, typeId } = await params;
  const artist = await getPublicArtist(handle.toLowerCase());
  const type = artist?.commissionTypes.find((t) => t.id === typeId);
  return artist && type ? { artist, type } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load(params);
  if (!found) return { title: "Not found" };
  return {
    title: `Request a ${found.type.name} from ${found.artist.displayName}`,
  };
}

export default async function RequestPage({ params }: Props) {
  const found = await load(params);
  if (!found) notFound();
  const { artist, type } = found;

  return (
    <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <p>
        <Link href={`/${artist.handle}`} className={linkClass}>
          Back to {artist.displayName}
        </Link>
      </p>

      <header className="flex flex-col gap-4">
        <h1 className="text-4xl sm:text-5xl">
          Request a {type.name} from {artist.displayName}
        </h1>
        <dl className="flex flex-wrap gap-3">
          <div className="rounded-full bg-sheet px-4 py-1.5">
            <dt className="sr-only">Starting price</dt>
            <dd className="font-semibold tabular-nums">From {formatMoney(type.basePriceMinor, artist.currency)}</dd>
          </div>
          <div className="rounded-full bg-sheet px-4 py-1.5">
            <dt className="sr-only">Turnaround</dt>
            <dd className="font-semibold">
              About {type.turnaroundDays} {type.turnaroundDays === 1 ? "day" : "days"}
            </dd>
          </div>
        </dl>
        <p className="text-muted">
          {artist.displayName} replies with a final price before any work
          starts. Nothing is paid now.
        </p>
      </header>

      {artist.slotsOpen ? (
        <div className={`${sheetClass} p-6 sm:p-8`}>
          <RequestForm action={sendRequest.bind(null, artist.handle, type.id)} />
        </div>
      ) : (
        <EmptyState title={`${artist.displayName} is not taking commissions right now`}>
          Their page shows when they open again.{" "}
          <Link href={`/${artist.handle}`} className={linkClass}>
            Go to their page
          </Link>
        </EmptyState>
      )}
    </main>
  );
}
