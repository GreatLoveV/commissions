import type { Metadata } from "next";
import { requireArtist } from "@/lib/session";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const artist = await requireArtist();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Profile settings</h1>
      {/* only pass the fields the form needs to the client component */}
      <SettingsForm
        profile={{
          handle: artist.handle,
          displayName: artist.displayName,
          bio: artist.bio,
          currency: artist.currency,
        }}
      />
    </div>
  );
}
