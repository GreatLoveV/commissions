import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { buttonClass, linkClass, sheetClass } from "@/components/styles";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { StageLine } from "@/components/ui/stage-line";
import { getRequest } from "@/lib/artist-requests";
import { formatMoney, minorToInput } from "@/lib/money";
import { requireArtist } from "@/lib/session";
import { describeEvent, moveLabel, simpleMoves, stageIndex, STAGES } from "@/lib/status";
import { storage } from "@/lib/storage";
import { trackingUrl } from "@/lib/tokens";
import { markPayment, removePayment } from "../actions";
import { CopyLink } from "../copy-link";
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

  const stage = stageIndex(request.status);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <p>
          <Link href="/dashboard" className={linkClass}>
            Back to the board
          </Link>
        </p>
        <div className="flex flex-col items-start gap-3">
          <StatusBadge status={request.status} />
          <h1 className="text-4xl sm:text-5xl">
            {request.typeNameSnapshot} for {request.clientName}
          </h1>
        </div>
        {stage !== null && (
          <div className={`${sheetClass} px-5 py-5 sm:px-8`}>
            <StageLine stages={STAGES} current={stage} label="Progress of this request" />
          </div>
        )}
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* the next step comes first on a phone: it is why the artist opened this page */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:order-2">
          {moves.length > 0 && (
            <Panel title="Next step">
              <div className="flex flex-col gap-3">
                {request.status === "AWAITING_PAYMENT" && paidTotal === 0 && (
                  <p className="text-sm text-muted">
                    No payment is recorded yet. You can still start, but most
                    artists wait for the deposit.
                  </p>
                )}
                <MoveButtons requestId={request.id} options={moves} />
              </div>
            </Panel>
          )}
          <Panel title="Client" tone="sunk">
            <dl className="flex flex-col gap-3">
              <div>
                <dt className="text-sm text-muted">Name</dt>
                <dd className="font-semibold">{request.clientName}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Email</dt>
                <dd className="break-all">
                  <a href={`mailto:${request.clientEmail}`} className={linkClass}>
                    {request.clientEmail}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Use</dt>
                <dd className="font-semibold">{request.usage === "COMMERCIAL" ? "Commercial" : "Personal"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Deadline</dt>
                <dd className="font-semibold">{request.deadline ? dayFormat.format(request.deadline) : "None given"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Listed price when requested</dt>
                <dd className="font-semibold tabular-nums">from {money(request.basePriceMinorSnapshot)}</dd>
              </div>
            </dl>
          </Panel>
          <Panel
            title="Client's private link"
            description="Where the client follows this request and answers your quote. Send it to them if they lost it. Anyone with the link can see the request."
          >
            <CopyLink url={trackingUrl(request.id)} />
          </Panel>
        </aside>

        <div className="flex min-w-0 flex-col gap-6 lg:order-1">
          <Panel title="What the client asked for">
            <div className="flex flex-col gap-5">
              <p className="max-w-prose whitespace-pre-line">{request.description}</p>
              <div className="flex flex-col gap-3">
                <h3 className="text-lg">Reference images</h3>
                {request.files.length === 0 ? (
                  <p className="text-muted">The client did not add any.</p>
                ) : (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {request.files.map((file) => (
                      <li key={file.id}>
                        {/* opens the full image. noreferrer keeps this page's url
                            from being sent along */}
                        <a href={storage.url(file.storageKey)} target="_blank" rel="noreferrer" className="block rounded-control">
                          <Image
                            src={storage.url(file.storageKey)}
                            alt={`Reference image ${file.originalName}, opens full size in a new tab`}
                            width={240}
                            height={240}
                            sizes="(min-width: 640px) 200px, 50vw"
                            className="aspect-square w-full rounded-control bg-sunk object-cover"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Panel>

          <section id="quote" aria-labelledby="quote-heading" className={`${sheetClass} flex scroll-mt-6 flex-col gap-4 p-5 sm:p-6`}>
            <h2 id="quote-heading" className="text-xl">
              Quote
            </h2>
            {request.quotedPriceMinor === null ? (
              <p className="text-muted">
                You have not sent a price yet. The client sees it on their
                request page and has to approve it before work starts.
              </p>
            ) : (
              <p className="flex flex-wrap items-baseline gap-x-3 tabular-nums">
                <span className="font-display text-3xl font-semibold">{money(request.quotedPriceMinor)}</span>
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

          <Panel
            title="Payments"
            description="Payments happen outside this app. Write down what the client has paid so you can see what is still owed."
          >
            <div className="flex flex-col gap-5">
              {request.quotedPriceMinor !== null && (
                <p className="font-semibold tabular-nums">
                  Paid {money(paidTotal)} of {money(request.quotedPriceMinor)}
                </p>
              )}
              {request.payments.length > 0 && (
                <ul className="divide-y divide-line rounded-control border border-line">
                  {request.payments.map((payment) => {
                    const paid = payment.status === "PAID";
                    return (
                      <li
                        key={payment.id}
                        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 p-4"
                      >
                        <div className="flex flex-col items-start gap-1">
                          <p className="font-semibold tabular-nums">
                            {payment.kind === "DEPOSIT" ? "Deposit" : "Final payment"},{" "}
                            {money(payment.amountMinor)}
                          </p>
                          <Badge tone={paid ? "open" : "warn"}>
                            {paid && payment.paidAt ? `Paid on ${dayFormat.format(payment.paidAt)}` : "Not paid yet"}
                          </Badge>
                          {payment.note && <p className="text-sm text-muted">{payment.note}</p>}
                        </div>
                        <div className="flex gap-2">
                          <form action={markPayment.bind(null, request.id, payment.id, !paid)}>
                            <button type="submit" className={buttonClass("secondary", "sm")}>
                              {paid ? "Mark as unpaid" : "Mark as paid"}
                            </button>
                          </form>
                          <form action={removePayment.bind(null, request.id, payment.id)}>
                            <button type="submit" className={buttonClass("danger", "sm")}>
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
            </div>
          </Panel>

          <Panel title="History">
            <ol className="flex flex-col gap-5 border-l-[3px] border-dashed border-blueline pl-6">
              {request.events.map((event) => (
                <li key={event.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 -left-[2.0625rem] size-3.5 rounded-full border-[3px] border-ink bg-sheet"
                  />
                  <p className="font-semibold">{describeEvent(event)}</p>
                  <p className="text-sm text-muted">
                    {ACTORS[event.actor]}, {timeFormat.format(event.createdAt)} UTC
                  </p>
                  {event.note && <p className="mt-1 whitespace-pre-line">{event.note}</p>}
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
}
