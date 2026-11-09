import type { Metadata } from "next";
import { buttonPrimary, buttonSecondary, sheetClass } from "@/components/styles";
import { requireArtist } from "@/lib/session";
import { setSlots } from "./actions";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const artist = await requireArtist();

  return (
    <div className="flex flex-col gap-8">
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

      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Requests</h1>
        <p className="text-muted">
          No requests yet. They will show up here once clients send them from
          your public page.
        </p>
      </section>
    </div>
  );
}
