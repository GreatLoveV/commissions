import type { Metadata } from "next";

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
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-4 py-10">
      {children}
    </main>
  );
}
