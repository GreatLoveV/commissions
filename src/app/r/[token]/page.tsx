import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { RequestStatus } from "@/generated/prisma/enums";
import { linkClass, sheetClass } from "@/components/styles";
import { formatMoney } from "@/lib/money";
import { getRequestByToken } from "@/lib/requests";
import { StatusBadge } from "@/components/status-badge";
import { StageLine } from "@/components/ui/stage-line";
import { describeEvent, stageIndex, STAGES } from "@/lib/status";
import { storage } from "@/lib/storage";
import { AnswerForm } from "./answer-form";

export const metadata: Metadata = { title: "Your request" };

const dayFormat = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" });

// What each status means for the client, in their words.
const STATUS_TEXT: Record<RequestStatus, { title: string; detail: string }> = {
  REQUESTED: {
    title: "Waiting for the artist to reply",
    detail: "The artist will read your request and send you a price.",
  },
  QUOTED: {
    title: "The artist sent you a price",
    detail: "Work starts only after you approve it.",
  },
  AWAITING_PAYMENT: {
    title: "Quote approved, payment is next",
    detail: "The artist will contact you about how to pay.",
  },
  IN_PROGRESS: {
    title: "The artist is working on it",
    detail: "You will get an email when there is something to look at.",
  },
  SKETCH_REVIEW: {
    title: "A sketch is ready for your feedback",
    detail: "The artist sends the sketch to you directly. Reply to them with your changes.",
  },
  DELIVERED: {
    title: "Delivered",
    detail: "The artist has marked this commission as delivered.",
  },
  DECLINED: {
    title: "The artist declined this request",
    detail: "No payment is due.",
  },
  CANCELLED: {
    title: "This request was cancelled",
    detail: "Nothing more will happen with it.",
  },
};

export default async function RequestStatusPage({
  params,
}: PageProps<"/r/[token]">) {
  const { token } = await params;
  const request = await getRequestByToken(token);
  if (!request) notFound();

  const status = STATUS_TEXT[request.status];
  const money = (minor: number) => formatMoney(minor, request.currency);
  const paid = request.payments.reduce((sum, payment) => sum + payment.amountMinor, 0);
  // the message the artist wrote with their latest quote
  const quoteNote = request.events.findLast((event) => event.type === "QUOTE_SENT")?.note;

  const stage = stageIndex(request.status);

  return (
    <>
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl sm:text-5xl">
          Your {request.typeNameSnapshot} request to{" "}
          {request.artist.displayName}
        </h1>
        <p className="text-muted">
          This link is your private page for this request. Only share it with
          people who should see it.
        </p>
      </header>

      <section aria-labelledby="status-heading" className={`${sheetClass} flex flex-col gap-6 p-6 sm:p-8`}>
        <div className="flex flex-col items-start gap-2">
          <StatusBadge status={request.status} />
          <h2 id="status-heading" className="text-2xl">
            {status.title}
          </h2>
          <p className="text-muted">{status.detail}</p>
        </div>

        {stage !== null && (
          <StageLine stages={STAGES} current={stage} label="Progress of your request" />
        )}

        {request.quotedPriceMinor !== null && (
          <div className="flex flex-col gap-4 rounded-control bg-sunk p-5">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 tabular-nums">
              <span className="text-sm text-muted">Price</span>
              <span className="font-display text-3xl font-semibold">{money(request.quotedPriceMinor)}</span>
              {paid > 0 && <span className="text-muted">{money(paid)} paid so far</span>}
            </p>
            {quoteNote && (
              <blockquote className="border-l-4 border-blueline pl-4 whitespace-pre-line">
                <p className="text-sm text-muted">From {request.artist.displayName}</p>
                <p>{quoteNote}</p>
              </blockquote>
            )}
            {request.status === "QUOTED" && (
              <AnswerForm token={token} priceMinor={request.quotedPriceMinor} />
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="timeline-heading" className="flex flex-col gap-4">
        <h2 id="timeline-heading" className="text-2xl">
          What has happened so far
        </h2>
        <ol className="flex flex-col gap-5 border-l-[3px] border-dashed border-blueline pl-6">
          {request.events.map((event) => (
            <li key={event.id} className="relative">
              <span
                aria-hidden="true"
                className="absolute top-1.5 -left-[2.0625rem] size-3.5 rounded-full border-[3px] border-ink bg-sheet"
              />
              <p className="font-semibold">{describeEvent(event)}</p>
              <p className="text-sm text-muted">{dayFormat.format(event.createdAt)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="brief-heading" className={`${sheetClass} flex flex-col gap-5 p-6 sm:p-8`}>
        <h2 id="brief-heading" className="text-2xl">
          What you asked for
        </h2>
        <p className="whitespace-pre-line">{request.description}</p>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">Use</dt>
            <dd className="font-semibold">{request.usage === "COMMERCIAL" ? "Commercial" : "Personal"}</dd>
          </div>
          {request.deadline && (
            <div>
              <dt className="text-sm text-muted">Deadline</dt>
              <dd className="font-semibold">{dayFormat.format(request.deadline)}</dd>
            </div>
          )}
        </dl>
        {request.files.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {request.files.map((file) => (
              <li key={file.id}>
                <Image
                  src={storage.url(file.storageKey)}
                  alt={`Reference image ${file.originalName}`}
                  width={240}
                  height={240}
                  sizes="(min-width: 640px) 200px, 50vw"
                  className="aspect-square w-full rounded-control bg-sunk object-cover"
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
