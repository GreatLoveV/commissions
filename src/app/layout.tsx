import type { Metadata } from "next";
import { Figtree, Fredoka } from "next/font/google";
import "./globals.css";

// round and friendly, for headings and artist names
const heading = Fredoka({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
});

// clear at small sizes, for everything else
const body = Figtree({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  // lets link previews build full urls
  metadataBase: new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000"),
  title: { default: "Commissions", template: "%s | Commissions" },
  description: "Commission manager for digital artists.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* first thing a keyboard user reaches: jumps past the navigation */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:font-semibold focus:text-canvas"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
