import type { Metadata } from "next";
import Link from "next/link";
import { buttonPrimary, buttonSecondary, linkClass, sheetClass } from "@/components/styles";
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Commission types</h1>
        <Link href="/dashboard/types/new" className={buttonPrimary}>
          Add a type
        </Link>
      </div>

      {types.length === 0 ? (
        <p className="text-muted">
          You have no commission types yet. Add the kinds of work you take on,
          each with a starting price, so clients know what to ask for.
        </p>
      ) : (
        <ul className={`${sheetClass} divide-y divide-line`}>
          {types.map((type) => (
            <li
              key={type.id}
              className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 p-4"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {type.name}
                  {!type.isActive && (
                    <span className="ml-2 text-sm font-normal text-muted">
                      Hidden from your page
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted tabular-nums">
                  From {formatMoney(type.basePriceMinor, artist.currency)},
                  about {type.turnaroundDays}{" "}
                  {type.turnaroundDays === 1 ? "day" : "days"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/dashboard/types/${type.id}`} className={linkClass}>
                  Edit
                </Link>
                <form action={setTypeActive.bind(null, type.id, !type.isActive)}>
                  <button type="submit" className={buttonSecondary}>
                    {type.isActive ? "Hide" : "Show"}
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
