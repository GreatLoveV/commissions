import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentArtist, requireUser } from "@/lib/session";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Set up your profile" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (await getCurrentArtist()) redirect("/dashboard");

  return (
    <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Set up your profile</h1>
        <p className="text-muted">
          This is what clients see on your public page. You can change it
          later.
        </p>
      </div>
      <OnboardingForm defaultName={user.name} />
    </main>
  );
}
