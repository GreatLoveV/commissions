import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Edit {type.name}</h1>
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
      </div>
      <section className="flex max-w-md flex-col gap-3 border-t border-line pt-6">
        <h2 className="text-lg font-semibold">Delete</h2>
        <DeleteType id={type.id} />
      </section>
    </div>
  );
}
