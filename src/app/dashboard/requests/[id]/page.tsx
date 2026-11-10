import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonSecondary, linkClass, sheetClass } from "@/components/styles";
import { getRequest } from "@/lib/artist-requests";
import { formatMoney, minorToInput } from "@/lib/money";
import { requireArtist } from "@/lib/session";
import { describeEvent, moveLabel, simpleMoves, STATUS_LABELS } from "@/lib/status";
import { storage } from "@/lib/storage";
import { markPayment, removePayment } from "../actions";
import { MoveButtons } from "../move-controls";
import { PaymentForm, QuoteForm } from "../request-forms";

export const metadata: Metadata = { title: "Request" };

const dayFormat = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" });
const timeFormat = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

const ACTORS = { ARTIST: "You", CLIENT: "Client", SYSTEM: "System" };

export default async function RequestPage({
  params,
}: PageProps<"/dashboard/requests/[id]">) {
  const { id } = await params;
  const artist = await requireArtist();

  // scoped to the artist: another artist's id is a 404 like any unknown id
  const request = await getRequest(artist.id, id);
  if (!request) notFound();

  const money = (minor: number) => formatMoney(minor, request.currency);
  const moves = simpleMoves(request.status).map((to) => ({
    to,
    label: moveLabel(request.status, to),
  }));
  const canQuote = request.status === "REQUESTED" || request.status === "QUOTED";
  const canAddPayment = request.status !== "REQUESTED" && request.status !== "DECLINED";
  const paidTotal = request.payments
    .filter((payment) => payment.status === "PAID")
    .reduce((sum, payment) => sum + payment.amountMinor, 0);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <p>
          <Link href="/dashboard" className={linkClass}>
            Back to the board
          </Link>
        </p>
        <h1 className="text-3xl font-semibold text-balance">
          {request.typeNameSnapshot} for {request.clientName}
        </h1>
        <p className="text-lg font-medium">{STATUS_LABELS[request.status]}</p>
      </header>

      {moves.length > 0 && (
        <section aria-labelledby="next-heading" className="flex flex-col gap-3">
          <h2 id="next-heading" className="text-xl font-semibold">
            Next step
          </h2>
          {request.status === "AWAITING_PAYMENT" && paidTotal === 0 && (
            <p className="text-muted">
              No payment is recorded yet. You can still start, but most
              artists wait for the deposit.
            </p>
          )}
          <MoveButtons requestId={request.id} options={moves} />
        </section>
      )}

      <section aria-labelledby="brief-heading" className={`${sheetClass} flex flex-col gap-4 p-6`}>
        <h2 id="brief-heading" className="text-xl font-semibold">
          What the client asked for
        </h2>
        <p className="max-w-prose whitespace-pre-line">{request.description}</p>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">Client</dt>
            <dd>
              {request.clientName},{" "}
              <a href={`mailto:${request.clientEmail}`} className={linkClass}>
                {request.clientEmail}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Use</dt>
            <dd>{request.usage === "COMMERCIAL" ? "Commercial" : "Personal"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Deadline</dt>
            <dd>{request.deadline ? dayFormat.format(request.deadline) : "None given"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Listed price when requested</dt>
            <dd className="tabular-nums">from {money(request.basePriceMinorSnapshot)}</dd>
          </div>
        </dl>

        <h3 className="font-semibold">Reference images</h3>
        {request.files.length === 0 ? (
          <p className="text-muted">The client did not add any.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {request.files.map((file) => (
              <li key={file.id}>
                {/* opens the full image. noreferrer keeps this page's url
                    from being sent along */}
                <a href={storage.url(file.storageKey)} target="_blank" rel="noreferrer">
                  <Image
                    src={storage.url(file.storageKey)}
                    alt={`Reference image ${file.originalName}, opens full size in a new tab`}
                    width={240}
                    height={240}
                    sizes="(min-width: 640px) 200px, 50vw"
                    className="aspect-square w-full rounded-sm border border-line object-cover"
                  />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="quote" aria-labelledby="quote-heading" className="flex scroll-mt-6 flex-col gap-4">
        <h2 id="quote-heading" className="text-xl font-semibold">
          Quote
        </h2>
        {request.quotedPriceMinor === null ? (
          <p className="text-muted">
            You have not sent a price yet. The client sees it on their
            request page and has to approve it before work starts.
          </p>
        ) : (
          <p className="tabular-nums">
            <span className="text-2xl font-semibold">{money(request.quotedPriceMinor)}</span>{" "}
            <span className="text-muted">
              {request.quoteApprovedAt
                ? `approved on ${dayFormat.format(request.quoteApprovedAt)}`
                : "waiting for the client's answer"}
            </span>
          </p>
        )}
        {canQuote && (
          <QuoteForm
            requestId={request.id}
            currency={request.currency}
            currentPrice={
              request.quotedPriceMinor === null
                ? undefined
                : minorToInput(request.quotedPriceMinor)
            }
          />
        )}
      </section>

      <section aria-labelledby="payments-heading" className="flex flex-col gap-4">
        <h2 id="payments-heading" className="text-xl font-semibold">
          Payments
        </h2>
        <p className="text-muted">
          Payments happen outside this app. Write down here what the client
          has paid so you can see what is still owed.
        </p>
        {request.quotedPriceMinor !== null && (
          <p className="tabular-nums">
            Paid {money(paidTotal)} of {money(request.quotedPriceMinor)}
          </p>
        )}
        {request.payments.length > 0 && (
          <ul className={`${sheetClass} divide-y divide-line`}>
            {request.payments.map((payment) => {
              const paid = payment.status === "PAID";
              return (
                <li
                  key={payment.id}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 p-4"
                >
                  <div>
                    <p className="font-medium tabular-nums">
                      {payment.kind === "DEPOSIT" ? "Deposit" : "Final payment"},{" "}
                      {money(payment.amountMinor)}
                    </p>
                    <p className="text-sm text-muted">
                      {paid && payment.paidAt
                        ? `Paid on ${dayFormat.format(payment.paidAt)}`
                        : "Not paid yet"}
                      {payment.note ? `. ${payment.note}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <form action={markPayment.bind(null, request.id, payment.id, !paid)}>
                      <button type="submit" className={buttonSecondary}>
                        {paid ? "Mark as unpaid" : "Mark as paid"}
                      </button>
                    </form>
                    <form action={removePayment.bind(null, request.id, payment.id)}>
                      <button type="submit" className={buttonSecondary}>
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {canAddPayment ? (
          <PaymentForm requestId={request.id} currency={request.currency} />
        ) : (
          request.status === "REQUESTED" && (
            <p className="text-muted">You can record payments once a quote is sent.</p>
          )
        )}
      </section>

      <section aria-labelledby="history-heading" className="flex flex-col gap-4">
        <h2 id="history-heading" className="text-xl font-semibold">
          History
        </h2>
        <ol className="flex flex-col gap-3 border-l border-line pl-4">
          {request.events.map((event) => (
            <li key={event.id}>
              <p className="font-medium">{describeEvent(event)}</p>
              <p className="text-sm text-muted">
                {ACTORS[event.actor]}, {timeFormat.format(event.createdAt)} UTC
              </p>
              {event.note && <p className="mt-1 whitespace-pre-line">{event.note}</p>}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
