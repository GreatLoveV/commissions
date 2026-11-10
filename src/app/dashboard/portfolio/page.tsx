import type { Metadata } from "next";
import Image from "next/image";
import { buttonClass } from "@/components/styles";
import { Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/states";
import { requireArtist } from "@/lib/session";
import { storage } from "@/lib/storage";
import { tenantDb } from "@/lib/tenant";
import { deletePortfolioImage } from "./actions";
import { UploadForm } from "./upload-form";

export const metadata: Metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const artist = await requireArtist();
  const images = await tenantDb(artist.id).portfolioImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl">Portfolio</h1>
        <p className="text-muted">The work clients see next to your prices.</p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <Panel title="Add an image" className="lg:sticky lg:top-6">
          <UploadForm />
        </Panel>

        <section aria-labelledby="on-page-heading" className="flex flex-col gap-4">
          <h2 id="on-page-heading" className="text-2xl">
            On your public page
          </h2>
          {images.length === 0 ? (
            <EmptyState title="No images yet">
              Add a few pieces that show the kind of work clients can
              commission.
            </EmptyState>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {images.map((image) => (
                <li key={image.id} className="flex flex-col gap-2 rounded-panel border border-line bg-sheet p-2">
                  <Image
                    src={storage.url(image.storageKey)}
                    alt={image.alt || "Artwork without a description"}
                    width={image.width}
                    height={image.height}
                    sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
                    className="aspect-square w-full rounded-control bg-sunk object-cover"
                  />
                  <div className="flex flex-col items-start gap-2 px-1 pb-1">
                    <p className="line-clamp-2 text-sm text-muted">
                      {image.alt || "No description"}
                    </p>
                    <form action={deletePortfolioImage.bind(null, image.id)}>
                      <button type="submit" className={buttonClass("ghost", "sm")}>
                        Remove
                        <span className="sr-only"> {image.alt || "this image"}</span>
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
