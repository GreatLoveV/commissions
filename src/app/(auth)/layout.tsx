import { Logo } from "@/components/logo";
import { BlankSheet } from "@/components/ui/doodles";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <Logo />
      </header>
      <main id="main" tabIndex={-1} className="flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:items-center sm:pt-0">
        <div className="relative w-full max-w-md">
          {/* a little drawing peeking over the corner of the form */}
          <BlankSheet className="absolute -top-14 -right-2 hidden w-24 rotate-6 sm:block" />
          <div className="flex flex-col gap-6 rounded-panel border border-line bg-sheet p-6 sm:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
