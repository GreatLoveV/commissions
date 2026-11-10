import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { linkClass, sheetClass } from "@/components/styles";
import { getRequestByToken } from "@/lib/requests";
import { storage } from "@/lib/storage";

export const metadata: Metadata = { title: "Your request" };

const dateFormat = new Intl.DateTimeFormat("en", {
  dateStyle: "long",
  timeZone: "UTC",
});

export default async function RequestStatusPage({
  params,
}: PageProps<"/r/[token]">) {
  const { token } = await params;
  const request = await getRequestByToken(token);
  if (!request) notFound();

  return (
    <>
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-balance">
          Your {request.typeNameSnapshot} request to{" "}
          {request.artist.displayName}
        </h1>
        <p className="text-muted">
          Save the link to this page. It is your private way back to this
          request, so only share it with people who should see it.
        </p>
      </header>

      <section className={`${sheetClass} flex flex-col gap-4 p-6`}>
        <h2 className="text-xl font-semibold">
          {request.status === "REQUESTED"
            ? "Waiting for the artist to reply"
            : "The artist has replied"}
        </h2>
        <dl className="flex flex-col gap-3">
          <div>
            <dt className="text-sm text-muted">Sent on</dt>
            <dd>{dateFormat.format(request.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Use</dt>
            <dd>{request.usage === "COMMERCIAL" ? "Commercial" : "Personal"}</dd>
          </div>
          {request.deadline && (
            <div>
              <dt className="text-sm text-muted">Deadline</dt>
              <dd>{dateFormat.format(request.deadline)}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm text-muted">What you asked for</dt>
            <dd className="whitespace-pre-line">{request.description}</dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Reference images</h2>
        {request.files.length === 0 ? (
          <p className="text-muted">You did not add any reference images.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {request.files.map((file) => (
              <li key={file.id}>
                <Image
                  src={storage.url(file.storageKey)}
                  alt={`Reference image ${file.originalName}`}
                  width={240}
                  height={240}
                  sizes="(min-width: 640px) 180px, 50vw"
                  className="aspect-square w-full rounded-sm border border-line bg-sheet object-cover"
                />
              </li>
            ))}
          </ul>
        )}
        {request.status === "REQUESTED" && (
          <p>
            <Link href={`/r/${token}/references`} className={linkClass}>
              Add or remove reference images
            </Link>
          </p>
        )}
      </section>
    </>
  );
}
