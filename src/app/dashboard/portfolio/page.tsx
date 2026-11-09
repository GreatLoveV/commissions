import type { Metadata } from "next";
import Image from "next/image";
import { buttonSecondary } from "@/components/styles";
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
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Portfolio</h1>
        <UploadForm />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">On your public page</h2>
        {images.length === 0 ? (
          <p className="text-muted">
            No images yet. Add a few pieces that show the kind of work clients
            can commission.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <li key={image.id} className="flex flex-col items-start gap-2">
                <Image
                  src={storage.url(image.storageKey)}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
                  className="aspect-square w-full rounded-sm border border-line bg-sheet object-cover"
                />
                <p className="text-sm text-muted">
                  {image.alt || "No description"}
                </p>
                <form action={deletePortfolioImage.bind(null, image.id)}>
                  <button type="submit" className={buttonSecondary}>
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
