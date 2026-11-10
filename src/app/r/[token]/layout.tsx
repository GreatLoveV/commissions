import type { Metadata } from "next";
import { Logo } from "@/components/logo";

// Pages under /r/<token> are private links. The token is in the url, so:
// - search engines must not index them
// - the browser must not send the url along when the client clicks a link
//   to another site (the Referer header)
// next.config.ts sets the same two rules as response headers.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function RequestLayout({ children }: LayoutProps<"/r/[token]">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-2xl px-4 py-4 sm:px-6">
        <Logo />
      </header>
      <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 pt-4 pb-16 sm:px-6">
        {children}
      </main>
    </div>
  );
}
