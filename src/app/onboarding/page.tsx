import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getCurrentArtist, requireUser } from "@/lib/session";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Set up your profile" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (await getCurrentArtist()) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <Logo />
      </header>
      <main id="main" tabIndex={-1} className="flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:items-center sm:pt-0">
        <div className="flex w-full max-w-md flex-col gap-6 rounded-panel border border-line bg-sheet p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl">Set up your page</h1>
            <p className="text-muted">
              This is what clients see on your public page. You can change it
              later.
            </p>
          </div>
          <OnboardingForm defaultName={user.name} />
        </div>
      </main>
    </div>
  );
}
