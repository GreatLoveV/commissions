import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonClass, sheetClass } from "@/components/styles";
import { Sticker } from "@/components/ui/badge";
import { getRequestByToken, MAX_REFERENCE_FILES } from "@/lib/requests";
import { storage } from "@/lib/storage";
import { removeReference } from "./actions";
import { ReferenceForm } from "./reference-form";

export const metadata: Metadata = { title: "Add reference images" };

export default async function ReferencesPage({
  params,
}: PageProps<"/r/[token]/references">) {
  const { token } = await params;
  const request = await getRequestByToken(token);
  if (!request) notFound();

  const canChange = request.status === "REQUESTED";
  const hasRoom = request.files.length < MAX_REFERENCE_FILES;

  return (
    <>
      <header className="flex flex-col items-start gap-3">
        <Sticker tone="open">Request sent</Sticker>
        <h1 className="text-4xl sm:text-5xl">
          Show {request.artist.displayName} what you have in mind
        </h1>
        <p className="text-muted">
          Add up to {MAX_REFERENCE_FILES} reference images: your character,
          a pose, colours you like. This step is optional.
        </p>
      </header>

      {request.files.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {request.files.map((file) => (
            <li key={file.id} className="flex flex-col items-start gap-2">
              <Image
                src={storage.url(file.storageKey)}
                // the client chose these files, the name is the best label we have
                alt={`Reference image ${file.originalName}`}
                width={240}
                height={240}
                sizes="(min-width: 640px) 180px, 50vw"
                className="aspect-square w-full rounded-control bg-sunk object-cover"
              />
              {canChange && (
                <form action={removeReference.bind(null, token, file.id)}>
                  <button type="submit" className={buttonClass("secondary", "sm")}>
                    Remove
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}

      {canChange && hasRoom && (
        <div className={`${sheetClass} p-6 sm:p-8`}>
          <ReferenceForm token={token} />
        </div>
      )}
      {canChange && !hasRoom && (
        <p className="rounded-control bg-sunk p-4">
          You have added the maximum of {MAX_REFERENCE_FILES} images. Remove
          one to add a different one.
        </p>
      )}
      {!canChange && (
        <p className="rounded-control bg-sunk p-4">
          The artist has already replied to this request, so its reference
          images can no longer be changed.
        </p>
      )}

      <p>
        <Link href={`/r/${token}`} className={buttonClass(request.files.length > 0 ? "primary" : "secondary")}>
          {request.files.length > 0 ? "Done" : "Skip this step"}
        </Link>
      </p>
    </>
  );
}
