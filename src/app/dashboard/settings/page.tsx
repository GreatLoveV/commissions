import type { Metadata } from "next";
import { Panel } from "@/components/ui/panel";
import { requireArtist } from "@/lib/session";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const artist = await requireArtist();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl">Settings</h1>
        <p className="text-muted">What clients see at the top of your page.</p>
      </div>
      <Panel title="Profile">
      {/* only pass the fields the form needs to the client component */}
      <SettingsForm
        profile={{
          handle: artist.handle,
          displayName: artist.displayName,
          bio: artist.bio,
          currency: artist.currency,
        }}
      />
      </Panel>
    </div>
  );
}
