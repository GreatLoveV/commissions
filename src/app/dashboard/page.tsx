import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass, linkClass, sheetClass } from "@/components/styles";
import { Sticker } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
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
    <li className={`${sheetClass} flex flex-col gap-3 p-4`}>
      <div>
        <Link
          href={`/dashboard/requests/${request.id}`}
          className="font-display text-lg font-semibold underline decoration-blueline decoration-2 underline-offset-4 hover:decoration-ink"
        >
          {request.clientName}
        </Link>
        <p className="text-sm text-muted">{request.typeNameSnapshot}</p>
      </div>
      {(request.quotedPriceMinor !== null || request.deadline) && (
        <dl className="flex flex-col gap-1 text-sm tabular-nums">
          {request.quotedPriceMinor !== null && (
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Quote</dt>
              <dd className="font-semibold">{formatMoney(request.quotedPriceMinor, request.currency)}</dd>
            </div>
          )}
          {request.deadline && (
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Deadline</dt>
              <dd className="font-semibold">{dateFormat.format(request.deadline)}</dd>
            </div>
          )}
        </dl>
      )}
      {request.status === "REQUESTED" && (
        <Link
          href={`/dashboard/requests/${request.id}#quote`}
          className={buttonClass("primary", "sm")}
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
  const onBoard = requests.length - closed.length;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="sr-only">Dashboard</h1>
      <section
        aria-labelledby="slots-heading"
        className={`${sheetClass} flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6`}
      >
        <div className="flex flex-col items-start gap-3">
          <h2 id="slots-heading">
            <Sticker tone={artist.slotsOpen ? "open" : "closed"}>
              {artist.slotsOpen ? "Commissions are open" : "Commissions are closed"}
            </Sticker>
          </h2>
          <p className="text-muted">
            {artist.slotsOpen
              ? "Clients can send you requests from your page."
              : "Your page says you are not taking requests right now."}
          </p>
        </div>
        <form action={setSlots.bind(null, !artist.slotsOpen)}>
          <button
            type="submit"
            className={buttonClass(artist.slotsOpen ? "secondary" : "primary")}
          >
            {artist.slotsOpen ? "Close commissions" : "Open commissions"}
          </button>
        </form>
      </section>

      <section aria-labelledby="requests-heading" className="flex flex-col gap-5">
        <h2 id="requests-heading" className="text-3xl">
          Requests
        </h2>

        {requests.length === 0 ? (
          <EmptyState
            title="No requests yet"
            action={
              <Link href={`/${artist.handle}`} className={buttonClass("primary")}>
                Open your page
              </Link>
            }
          >
            Requests show up here when a client fills in the form on your page.
            Share its link wherever you post your art.
          </EmptyState>
        ) : onBoard === 0 ? (
          <p className="rounded-control bg-sunk p-4">
            Nothing on the board right now. Finished requests that were
            declined or cancelled are listed below.
          </p>
        ) : (
          // Stacked on a phone, two columns on a tablet. From large screens
          // up the columns sit side by side and share the width. If the
          // window is too narrow for six columns the row scrolls sideways,
          // and tabIndex lets keyboard users scroll it.
          <div
            role="region"
            aria-label="Request board"
            tabIndex={0}
            className="grid gap-6 rounded-panel md:grid-cols-2 lg:flex lg:gap-4 lg:overflow-x-auto lg:pb-4"
          >
            {BOARD_STATUSES.map((status) => {
              const inColumn = requests.filter((r) => r.status === status);
              return (
                <section
                  key={status}
                  aria-labelledby={`column-${status}`}
                  className="flex flex-col gap-3 lg:min-w-48 lg:flex-1 lg:basis-0"
                >
                  <h3
                    id={`column-${status}`}
                    className="flex items-center justify-between gap-2 border-b-[3px] border-dashed border-blueline pb-2 text-lg"
                  >
                    {STATUS_LABELS[status]}
                    <span className="grid min-w-7 place-items-center rounded-full bg-sheet px-2 py-0.5 font-sans text-sm font-semibold tabular-nums">
                      {inColumn.length}
                    </span>
                  </h3>
                  {inColumn.length === 0 ? (
                    <p className="rounded-control border-2 border-dashed border-line px-3 py-4 text-center text-sm text-muted">
                      Nothing here
                    </p>
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
        )}
      </section>

      {closed.length > 0 && (
        <details className={`${sheetClass} p-5`}>
          <summary className="cursor-pointer font-semibold">
            Declined and cancelled ({closed.length})
          </summary>
          <ul className="mt-4 flex flex-col gap-2">
            {closed.map((request) => (
              <li key={request.id} className="flex flex-wrap items-baseline gap-x-2">
                <Link href={`/dashboard/requests/${request.id}`} className={linkClass}>
                  {request.clientName}, {request.typeNameSnapshot}
                </Link>
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
