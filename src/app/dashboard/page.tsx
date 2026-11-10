import type { Metadata } from "next";
import Link from "next/link";
import { buttonPrimary, buttonSecondary, sheetClass } from "@/components/styles";
import { listRequests } from "@/lib/artist-requests";
import { formatMoney } from "@/lib/money";
import { requireArtist } from "@/lib/session";
import {
  BOARD_STATUSES,
  CLOSED_STATUSES,
  simpleMoves,
  STATUS_LABELS,
} from "@/lib/status";
import { setSlots } from "./actions";
import { MoveSelect } from "./requests/move-controls";

export const metadata: Metadata = { title: "Dashboard" };

type BoardRequest = Awaited<ReturnType<typeof listRequests>>[number];

const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function RequestCard({ request }: { request: BoardRequest }) {
  const moves = simpleMoves(request.status).map((to) => ({
    to,
    label: STATUS_LABELS[to],
  }));

  return (
    <li className={`${sheetClass} flex flex-col gap-3 p-3`}>
      <div>
        <Link
          href={`/dashboard/requests/${request.id}`}
          className="font-medium underline underline-offset-2 hover:text-accent"
        >
          {request.clientName}
        </Link>
        <p className="text-sm text-muted">{request.typeNameSnapshot}</p>
      </div>
      <dl className="flex flex-col gap-1 text-sm tabular-nums">
        {request.quotedPriceMinor !== null && (
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Quote</dt>
            <dd>{formatMoney(request.quotedPriceMinor, request.currency)}</dd>
          </div>
        )}
        {request.deadline && (
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Deadline</dt>
            <dd>{dateFormat.format(request.deadline)}</dd>
          </div>
        )}
      </dl>
      {request.status === "REQUESTED" && (
        <Link
          href={`/dashboard/requests/${request.id}#quote`}
          className="text-sm font-medium text-accent underline underline-offset-2"
        >
          Send a quote
        </Link>
      )}
      {moves.length > 0 && <MoveSelect requestId={request.id} options={moves} />}
    </li>
  );
}

export default async function DashboardPage() {
  const artist = await requireArtist();
  const requests = await listRequests(artist.id);
  const closed = requests.filter((r) => CLOSED_STATUSES.includes(r.status));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="sr-only">Dashboard</h1>
      <section
        aria-labelledby="slots-heading"
        className={`${sheetClass} flex flex-wrap items-center justify-between gap-4 p-4`}
      >
        <div>
          <h2 id="slots-heading" className="text-lg font-semibold">
            {artist.slotsOpen
              ? "Commissions are open"
              : "Commissions are closed"}
          </h2>
          <p className="text-muted">
            {artist.slotsOpen
              ? "Clients can send you requests from your public page."
              : "Your public page says you are not taking requests right now."}
          </p>
        </div>
        <form action={setSlots.bind(null, !artist.slotsOpen)}>
          <button
            type="submit"
            className={artist.slotsOpen ? buttonSecondary : buttonPrimary}
          >
            {artist.slotsOpen ? "Close commissions" : "Open commissions"}
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Requests</h2>
        {requests.length === 0 && (
          <p className="text-muted">
            No requests yet. They show up here when a client sends one from
            your public page.
          </p>
        )}

        {/* Stacked on a phone. From large screens up the columns sit side
            by side and share the width. If the window is too narrow for
            six columns the row scrolls sideways, and tabIndex lets
            keyboard users scroll it. */}
        <div
          role="region"
          aria-label="Request board"
          tabIndex={0}
          className="flex flex-col gap-6 lg:flex-row lg:gap-4 lg:overflow-x-auto lg:pb-4"
        >
          {BOARD_STATUSES.map((status) => {
            const inColumn = requests.filter((r) => r.status === status);
            return (
              <section
                key={status}
                aria-labelledby={`column-${status}`}
                className="flex flex-col gap-3 lg:min-w-48 lg:flex-1"
              >
                <h3
                  id={`column-${status}`}
                  className="flex items-baseline justify-between border-b border-line pb-2 font-display font-semibold"
                >
                  {STATUS_LABELS[status]}
                  <span className="text-sm font-normal text-muted tabular-nums">
                    {inColumn.length}
                  </span>
                </h3>
                {inColumn.length === 0 ? (
                  <p className="text-sm text-muted">Nothing here.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {inColumn.map((request) => (
                      <RequestCard key={request.id} request={request} />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </section>

      {closed.length > 0 && (
        <details>
          <summary className="cursor-pointer font-medium">
            Declined and cancelled ({closed.length})
          </summary>
          <ul className="mt-3 flex flex-col gap-2">
            {closed.map((request) => (
              <li key={request.id}>
                <Link
                  href={`/dashboard/requests/${request.id}`}
                  className="underline underline-offset-2 hover:text-accent"
                >
                  {request.clientName}, {request.typeNameSnapshot}
                </Link>{" "}
                <span className="text-sm text-muted">
                  {STATUS_LABELS[request.status]}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
