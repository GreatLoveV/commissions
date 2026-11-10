import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { buttonClass, linkClass } from "@/components/styles";
import { Sticker } from "@/components/ui/badge";
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
    <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:py-16">
      <header className="flex max-w-3xl flex-col items-start gap-5">
        <h1 className="text-5xl leading-none break-words sm:text-6xl lg:text-7xl">
          {artist.displayName}
        </h1>
        <Sticker tone={artist.slotsOpen ? "open" : "closed"}>
          {artist.slotsOpen ? "Open for commissions" : "Not taking commissions right now"}
        </Sticker>
        {artist.bio && (
          <p className="max-w-prose text-lg whitespace-pre-line text-muted">
            {artist.bio}
          </p>
        )}
      </header>

      <div
        className={`mt-12 grid gap-12 lg:mt-16 lg:items-start ${
          hasImages ? "lg:grid-cols-[minmax(0,1fr)_25rem]" : "max-w-xl"
        }`}
      >
        {/* On a phone the price list comes first: it is what a client
            came for. On a wide screen it sits beside the work. */}
        <section
          aria-labelledby="types-heading"
          className="rounded-panel border-2 border-ink bg-sheet p-6 shadow-[5px_6px_0_var(--color-ink)] sm:p-7 lg:sticky lg:top-8 lg:order-2"
        >
          <h2 id="types-heading" className="text-3xl">
            Commission sheet
          </h2>
          {artist.commissionTypes.length === 0 ? (
            <p className="mt-4 text-muted">
              {artist.displayName} has not listed any commission types yet.
              Check back soon.
            </p>
          ) : (
            <ul className="mt-6 flex flex-col gap-7">
              {artist.commissionTypes.map((type) => (
                <li key={type.id} className="flex flex-col gap-1.5">
                  <p className="flex items-baseline gap-2 text-lg font-semibold">
                    <span>{type.name}</span>
                    <span
                      aria-hidden="true"
                      className="min-w-4 flex-1 -translate-y-1 border-b-2 border-dotted border-blueline"
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
                    <p className="mt-2">
                      <Link
                        href={`/${artist.handle}/request/${type.id}`}
                        className={buttonClass("primary", "sm")}
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
            <ul className="columns-2 gap-4 sm:columns-3 lg:columns-2 xl:columns-3">
              {artist.portfolioImages.map((image, index) => (
                <li key={image.id} className="mb-4 break-inside-avoid">
                  <Image
                    src={storage.url(image.storageKey)}
                    // an image without a description still gets a name
                    alt={image.alt || `Artwork by ${artist.displayName}, ${index + 1} of ${artist.portfolioImages.length}`}
                    width={image.width}
                    height={image.height}
                    sizes="(min-width: 1280px) 260px, (min-width: 1024px) 320px, (min-width: 640px) 33vw, 50vw"
                    // the first images are visible straight away
                    priority={index < 3}
                    className="h-auto w-full rounded-control bg-sunk"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className="mt-20 flex flex-wrap items-center gap-2 border-t-2 border-dashed border-blueline pt-6 text-sm text-muted">
        <Link href="/" className={linkClass}>
          Make a commission page like this one
        </Link>
      </footer>
    </main>
  );
}
