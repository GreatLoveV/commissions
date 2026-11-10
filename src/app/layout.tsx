import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

const heading = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
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
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-sm focus:bg-sheet focus:px-4 focus:py-2 focus:font-medium"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
