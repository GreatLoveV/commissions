import type { Metadata } from "next";
import Link from "next/link";
import { requireArtist } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const artist = await requireArtist();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Requests</h1>
      <p className="text-neutral-600">
        No requests yet. They will show up here once clients can send them
        from your public page at{" "}
        <span className="font-mono text-neutral-900">/{artist.handle}</span>.
      </p>
      <p>
        <Link href="/dashboard/settings" className="underline">
          Edit your profile
        </Link>
      </p>
    </div>
  );
}
