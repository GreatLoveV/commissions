import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass, sheetClass } from "@/components/styles";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { formatMoney } from "@/lib/money";
import { requireArtist } from "@/lib/session";
import { tenantDb } from "@/lib/tenant";
import { setTypeActive } from "./actions";

export const metadata: Metadata = { title: "Commission types" };

export default async function TypesPage() {
  const artist = await requireArtist();
  const types = await tenantDb(artist.id).commissionType.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl">Commission types</h1>
          <p className="text-muted">The kinds of work you take on, as listed on your page.</p>
        </div>
        {types.length > 0 && (
          <Link href="/dashboard/types/new" className={buttonClass("primary")}>
            Add a type
          </Link>
        )}
      </div>

      {types.length === 0 ? (
        <EmptyState
          title="No commission types yet"
          action={
            <Link href="/dashboard/types/new" className={buttonClass("primary")}>
              Add your first type
            </Link>
          }
        >
          Add the kinds of work you take on, each with a starting price, so
          clients know what to ask for.
        </EmptyState>
      ) : (
        <ul className={`${sheetClass} divide-y divide-line`}>
          {types.map((type) => (
            <li
              key={type.id}
              className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 p-5"
            >
              <div className="flex min-w-0 flex-col items-start gap-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-xl font-semibold">{type.name}</span>
                  {!type.isActive && <Badge>Hidden from your page</Badge>}
                </p>
                <p className="text-sm text-muted tabular-nums">
                  From {formatMoney(type.basePriceMinor, artist.currency)},
                  about {type.turnaroundDays}{" "}
                  {type.turnaroundDays === 1 ? "day" : "days"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/types/${type.id}`} className={buttonClass("secondary", "sm")}>
                  Edit
                  <span className="sr-only"> {type.name}</span>
                </Link>
                <form action={setTypeActive.bind(null, type.id, !type.isActive)}>
                  <button type="submit" className={buttonClass("ghost", "sm")}>
                    {type.isActive ? "Hide" : "Show"}
                    <span className="sr-only"> {type.name}</span>
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
