import type { Metadata } from "next";
import Link from "next/link";
import { linkClass } from "@/components/styles";
import { Panel } from "@/components/ui/panel";
import { requireArtist } from "@/lib/session";
import { createType } from "../actions";
import { TypeForm } from "../type-form";

export const metadata: Metadata = { title: "Add a commission type" };

export default async function NewTypePage() {
  const artist = await requireArtist();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <p>
        <Link href="/dashboard/types" className={linkClass}>
          Back to commission types
        </Link>
      </p>
      <h1 className="text-4xl">Add a commission type</h1>
      <Panel>
        <TypeForm
          action={createType}
          currency={artist.currency}
          submitLabel="Add type"
        />
      </Panel>
    </div>
  );
}
