import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { linkClass } from "@/components/styles";
import { Panel } from "@/components/ui/panel";
import { minorToInput } from "@/lib/money";
import { requireArtist } from "@/lib/session";
import { tenantDb } from "@/lib/tenant";
import { updateType } from "../actions";
import { DeleteType } from "../delete-type";
import { TypeForm } from "../type-form";

export const metadata: Metadata = { title: "Edit commission type" };

export default async function EditTypePage({
  params,
}: PageProps<"/dashboard/types/[id]">) {
  const { id } = await params;
  const artist = await requireArtist();

  // Scoped to the artist: someone else's id gives a 404, same as an id
  // that does not exist.
  const type = await tenantDb(artist.id).commissionType.findUnique({
    where: { id },
  });
  if (!type) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <p>
        <Link href="/dashboard/types" className={linkClass}>
          Back to commission types
        </Link>
      </p>
      <h1 className="text-4xl">Edit {type.name}</h1>
      <Panel>
        <TypeForm
          action={updateType.bind(null, type.id)}
          currency={artist.currency}
          submitLabel="Save changes"
          initial={{
            name: type.name,
            description: type.description,
            basePrice: minorToInput(type.basePriceMinor),
            turnaroundDays: String(type.turnaroundDays),
          }}
        />
      </Panel>
      <Panel title="Delete this type" tone="sunk">
        <DeleteType id={type.id} name={type.name} />
      </Panel>
    </div>
  );
}
