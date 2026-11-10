import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { linkClass, sheetClass } from "@/components/styles";
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
    <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-4 py-10">
      <p>
        <Link href={`/${artist.handle}`} className={linkClass}>
          Back to {artist.displayName}
        </Link>
      </p>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-balance">
          Request a {type.name} from {artist.displayName}
        </h1>
        <p className="text-muted tabular-nums">
          From {formatMoney(type.basePriceMinor, artist.currency)}, ready in
          about {type.turnaroundDays}{" "}
          {type.turnaroundDays === 1 ? "day" : "days"}. The artist replies
          with a final price before any work starts.
        </p>
      </header>

      {artist.slotsOpen ? (
        <div className={`${sheetClass} p-6`}>
          <RequestForm action={sendRequest.bind(null, artist.handle, type.id)} />
        </div>
      ) : (
        <p className={`${sheetClass} p-6`}>
          {artist.displayName} is not taking commissions right now. Check
          their page again later.
        </p>
      )}
    </main>
  );
}
