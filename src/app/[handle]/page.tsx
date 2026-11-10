import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { formatMoney } from "@/lib/money";
import { getPublicArtist } from "@/lib/public";
import { storage } from "@/lib/storage";

type Props = PageProps<"/[handle]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const artist = await getPublicArtist(handle.toLowerCase());
  if (!artist) return { title: "Artist not found" };

  const title = `${artist.displayName}: commissions`;
  const description =
    artist.bio ||
    `Commission types, prices and turnaround times for ${artist.displayName}.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
  };
}

export default async function ArtistPage({ params }: Props) {
  const { handle } = await params;
  // handles are stored lowercase, so /InkDraws goes to /inkdraws
  if (handle !== handle.toLowerCase()) {
    permanentRedirect(`/${handle.toLowerCase()}`);
  }

  const artist = await getPublicArtist(handle);
  if (!artist) notFound();

  const hasImages = artist.portfolioImages.length > 0;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 lg:py-16">
      <header className="flex max-w-3xl flex-col gap-4">
        <h1 className="font-display text-5xl leading-none font-semibold text-balance break-words sm:text-6xl lg:text-7xl">
          {artist.displayName}
        </h1>
        <p className="flex items-center gap-2 text-lg font-medium">
          {/* the dot is decoration, the sentence carries the meaning */}
          <span
            aria-hidden="true"
            className={`size-2.5 rounded-full ${artist.slotsOpen ? "bg-open" : "bg-muted"}`}
          />
          {artist.slotsOpen
            ? "Open for commissions"
            : "Not taking commissions right now"}
        </p>
        {artist.bio && (
          <p className="max-w-prose text-lg whitespace-pre-line text-muted">
            {artist.bio}
          </p>
        )}
      </header>

      <div
        className={`mt-10 grid gap-10 lg:mt-14 lg:items-start ${
          hasImages ? "lg:grid-cols-[minmax(0,1fr)_24rem]" : "max-w-xl"
        }`}
      >
        {/* On a phone the price list comes first: it is what a client
            came for. On a wide screen it sits beside the work. */}
        <section
          aria-labelledby="types-heading"
          className="rounded-sm border border-line bg-sheet p-6 lg:sticky lg:top-8 lg:order-2"
        >
          <h2 id="types-heading" className="text-2xl font-semibold">
            Commission sheet
          </h2>
          {artist.commissionTypes.length === 0 ? (
            <p className="mt-4 text-muted">
              No commission types are listed yet.
            </p>
          ) : (
            <ul className="mt-5 flex flex-col gap-6">
              {artist.commissionTypes.map((type) => (
                <li key={type.id} className="flex flex-col gap-1">
                  <p className="flex items-baseline gap-2 text-lg font-medium">
                    <span>{type.name}</span>
                    <span
                      aria-hidden="true"
                      className="min-w-4 flex-1 -translate-y-1 border-b border-dotted border-muted"
                    />
                    <span className="whitespace-nowrap tabular-nums">
                      from {formatMoney(type.basePriceMinor, artist.currency)}
                    </span>
                  </p>
                  {type.description && (
                    <p className="whitespace-pre-line text-muted">
                      {type.description}
                    </p>
                  )}
                  <p className="text-sm text-muted">
                    Ready in about {type.turnaroundDays}{" "}
                    {type.turnaroundDays === 1 ? "day" : "days"}
                  </p>
                  {artist.slotsOpen && (
                    <p className="mt-1">
                      <Link
                        href={`/${artist.handle}/request/${type.id}`}
                        className="font-medium text-accent underline underline-offset-2 hover:text-accent-strong"
                      >
                        Request a {type.name}
                      </Link>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {hasImages && (
          <section aria-labelledby="work-heading" className="lg:order-1">
            <h2 id="work-heading" className="sr-only">
              Portfolio
            </h2>
            {/* CSS columns keep every image at its own shape instead of
                cropping them all to one size */}
            <ul className="columns-2 gap-3 sm:columns-3 lg:columns-2 xl:columns-3">
              {artist.portfolioImages.map((image, index) => (
                <li key={image.id} className="mb-3 break-inside-avoid">
                  <Image
                    src={storage.url(image.storageKey)}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    sizes="(min-width: 1280px) 260px, (min-width: 1024px) 320px, (min-width: 640px) 33vw, 50vw"
                    // the first images are visible straight away
                    priority={index < 3}
                    className="h-auto w-full rounded-sm bg-line"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className="mt-16 text-sm text-muted">
        <Link href="/" className="underline underline-offset-2 hover:text-ink">
          Make a commission page like this one
        </Link>
      </footer>
    </main>
  );
}
