import type { Metadata } from "next";
import { requireArtist } from "@/lib/session";
import { createType } from "../actions";
import { TypeForm } from "../type-form";

export const metadata: Metadata = { title: "Add a commission type" };

export default async function NewTypePage() {
  const artist = await requireArtist();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Add a commission type</h1>
      <TypeForm
        action={createType}
        currency={artist.currency}
        submitLabel="Add type"
      />
    </div>
  );
}
