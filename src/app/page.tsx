import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buttonClass, linkClass } from "@/components/styles";
import { Sticker } from "@/components/ui/badge";
import { Scribble } from "@/components/ui/doodles";
import { StageLine } from "@/components/ui/stage-line";
import { STAGES } from "@/lib/status";

// An example commission sheet, labelled as one, so a visitor sees what
// their own public page will look like before signing up.
const exampleTypes = [
  { name: "Headshot", price: "$35", days: 5 },
  { name: "Half body", price: "$60", days: 7 },
  { name: "Full body", price: "$95", days: 10 },
];

// a list with blue pencil ticks instead of bullets
function TickList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-4 text-lg">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-1 size-6 shrink-0" fill="none">
            <path d="M4 13l5 5L20 6" stroke="var(--color-blueline)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ExampleSheet() {
  return (
    <figure className="relative mx-auto w-full max-w-md lg:mx-0">
      <div className="rotate-1 rounded-panel border-2 border-ink bg-sheet p-6 shadow-[6px_8px_0_var(--color-ink)] sm:p-7">
        <p className="font-display text-3xl font-semibold">Your name here</p>
        <div className="mt-3">
          <Sticker>Open for commissions</Sticker>
        </div>
        <ul className="mt-6 flex flex-col gap-4">
          {exampleTypes.map((type) => (
            <li key={type.name} className="flex flex-col">
              <p className="flex items-baseline gap-2 text-lg font-semibold">
                <span>{type.name}</span>
                <span aria-hidden="true" className="min-w-4 flex-1 -translate-y-1 border-b-2 border-dotted border-blueline" />
                <span className="tabular-nums">from {type.price}</span>
              </p>
              <p className="text-sm text-muted">Ready in about {type.days} days</p>
            </li>
          ))}
        </ul>
        <p className={`${buttonClass("primary", "sm")} mt-6 w-full`} aria-hidden="true">
          Request a commission
        </p>
      </div>
      <figcaption className="mt-5 text-center text-sm text-muted lg:text-left">
        An example of a commission page, with made-up prices.
      </figcaption>
    </figure>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-16">
          <div className="flex flex-col items-start gap-6">
            <h1 className="text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Keep your art commissions{" "}
              <span className="relative inline-block">
                out of your DMs
                <Scribble className="absolute -bottom-3 left-0 h-4 w-full" draw />
              </span>
            </h1>
            <p className="max-w-xl text-xl text-muted">
              One page with your prices, a proper request form for your clients,
              and a board that shows where every commission stands.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/signup" className={buttonClass("primary", "lg")}>
                Sign up free
              </Link>
              <Link href="/login" className={buttonClass("ghost", "lg")}>
                Log in
              </Link>
            </div>
          </div>
          <ExampleSheet />
        </section>

        <section aria-labelledby="journey-heading" className="border-y border-line bg-sheet">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6">
            <div className="flex max-w-2xl flex-col gap-3">
              <h2 id="journey-heading" className="text-4xl">
                Every commission, from first message to final file
              </h2>
              <p className="text-lg text-muted">
                A request moves through the same steps you already follow. You
                move it along with one click, and your client sees where it is
                without asking.
              </p>
            </div>
            <StageLine stages={STAGES} current={3} label="Example: a commission that is in progress" />
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl">For you</h2>
            <TickList
              items={[
                "A public page at your own address with your work and prices.",
                "A switch to open or close commissions.",
                "Every request on one board, with the brief and references in one place.",
                "Quotes and payments written down, so nothing gets lost in a chat.",
              ]}
            />
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl">For your clients</h2>
            <TickList
              items={[
                "No account to make.",
                "A clear form that asks what you need to know.",
                "A private link to follow their commission.",
                "An email each time something changes.",
              ]}
            />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="flex flex-col items-start gap-5 rounded-panel bg-blueline-soft p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
            <h2 className="text-3xl">Ready to share your commission page?</h2>
            <Link href="/signup" className={buttonClass("ink", "lg")}>
              Sign up free
            </Link>
          </div>
        </section>
      </main>
      <footer className="mx-auto w-full max-w-6xl px-4 pb-10 text-sm text-muted sm:px-6">
        <p>
          Made for artists who take commissions.{" "}
          <Link href="/login" className={linkClass}>
            Log in
          </Link>
        </p>
      </footer>
    </div>
  );
}
