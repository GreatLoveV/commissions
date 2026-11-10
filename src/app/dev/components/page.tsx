import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Field, FormMessage, Select, TextArea } from "@/components/form";
import { buttonClass, linkClass, type ButtonSize, type ButtonVariant } from "@/components/styles";
import { Badge, Sticker } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scribble } from "@/components/ui/doodles";
import { NavPills } from "@/components/ui/nav";
import { Panel } from "@/components/ui/panel";
import { StageLine } from "@/components/ui/stage-line";
import { EmptyState, LoadingState, Skeleton, Spinner } from "@/components/ui/states";
import { Table, Td, Th } from "@/components/ui/table";
import { ErrorDemo, ModalDemo, ToastDemo } from "./demos";

// Every component in every state, to check the design system in one place.
// Only exists in development.

export const metadata: Metadata = { title: "Components", robots: { index: false } };

const swatches = [
  ["canvas", "Paper", "#fbf6ef"],
  ["sheet", "Sheet", "#ffffff"],
  ["sunk", "Well", "#f4ede3"],
  ["ink", "Ink", "#26212e"],
  ["muted", "Muted ink", "#6a6273"],
  ["blueline", "Blue pencil", "#8ec1f2"],
  ["accent", "Link blue", "#2b57c8"],
  ["pink", "Sticker pink", "#ff8db5"],
  ["pink-strong", "Pink ink", "#b4235e"],
  ["open", "Open green", "#256b43"],
  ["warn", "Amber", "#8a5a00"],
  ["danger", "Red", "#b0352b"],
] as const;

const variants: ButtonVariant[] = ["primary", "secondary", "ink", "ghost", "danger"];
const sizes: ButtonSize[] = ["sm", "md", "lg"];

const stages = [
  { label: "Requested" },
  { label: "Quoted" },
  { label: "Paid" },
  { label: "In progress" },
  { label: "Sketch review" },
  { label: "Delivered" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const id = title.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 border-t-2 border-dashed border-blueline pt-8">
      <h2 id={id} className="text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ComponentsPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="relative w-fit text-5xl sm:text-6xl">
          Components
          <Scribble className="absolute -bottom-2 left-0 h-3 w-full" />
        </h1>
        <p className="max-w-prose text-lg text-muted">
          Every piece of the interface in every state. Only visible in development.
        </p>
      </header>

      <Section title="Colour">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {swatches.map(([token, name, hex]) => (
            <li key={token} className="flex flex-col gap-2">
              <span
                className="h-16 rounded-control border border-line"
                // the hex, not var(): "@theme inline" only writes the
                // variables that utility classes use
                style={{ background: hex }}
              />
              <span className="text-sm font-semibold">{name}</span>
              <span className="text-xs text-muted tabular-nums">{hex}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type">
        <div className="flex flex-col gap-3">
          <p className="font-display text-6xl font-semibold">Mira draws</p>
          <p className="font-display text-4xl font-semibold">Commission sheet</p>
          <p className="font-display text-2xl font-semibold">Full body, flat colour</p>
          <p className="max-w-prose text-lg">
            A full body drawing of your character with flat colours and a simple background. Ready in
            about 10 days.
          </p>
          <p className="text-sm text-muted">Small print: prices are in US dollars and include one round of sketch changes.</p>
          <p className="tabular-nums">Prices line up: $40.00, $125.00 and $1,080.00</p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-col gap-4">
          {variants.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-3">
              <span className="w-24 text-sm text-muted">{variant}</span>
              {sizes.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {size === "sm" ? "Move" : size === "md" ? "Send quote" : "Open my page"}
                </Button>
              ))}
              <Button variant={variant} disabled>
                Disabled
              </Button>
              <Button variant={variant} loading>
                Saving
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-24 text-sm text-muted">link</span>
            <a href="#main" className={linkClass}>
              View public page
            </a>
            <a href="#main" className={buttonClass("primary", "md")}>
              A link that looks like a button
            </a>
          </div>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Display name" name="demo-name" defaultValue="Mira" hint="Shown at the top of your page." />
          <Field label="Email" name="demo-email" type="email" hint="Clients never see this." />
          <Field label="Handle" name="demo-handle" defaultValue="mira draws" errors={["Use only lowercase letters, numbers and dashes"]} />
          <Select
            label="Currency"
            name="demo-currency"
            defaultValue="EUR"
            options={[
              { value: "USD", label: "US dollar (USD)" },
              { value: "EUR", label: "Euro (EUR)" },
              { value: "MAD", label: "Moroccan dirham (MAD)" },
            ]}
          />
          <div className="sm:col-span-2">
            <TextArea label="What would you like drawn?" name="demo-brief" hint="Describe the character, pose and mood." />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="demo-disabled" className="text-sm font-medium">
              Disabled
            </label>
            <input id="demo-disabled" disabled defaultValue="Can't change this" className="w-full rounded-control border-2 border-line bg-sunk px-3.5 py-2.5 text-muted" />
          </div>
          <div className="flex flex-col justify-end gap-2">
            <FormMessage ok message="Settings saved." />
            <FormMessage message="That handle is already taken." />
          </div>
        </div>
      </Section>

      <Section title="Badges and stickers">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Requested</Badge>
          <Badge tone="blue">Quoted</Badge>
          <Badge tone="warn">Awaiting payment</Badge>
          <Badge tone="pink">Sketch review</Badge>
          <Badge tone="open">Delivered</Badge>
          <Badge tone="danger">Declined</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-6 py-2">
          <Sticker>Open for commissions</Sticker>
          <Sticker tone="closed">Closed for now</Sticker>
          <Sticker tone="pink">3 slots left</Sticker>
        </div>
      </Section>

      <Section title="Stage line">
        <Panel title="Where your commission is" headingLevel={3}>
          <StageLine stages={stages} current={3} label="Commission progress" />
        </Panel>
        <Panel title="Just sent" headingLevel={3} tone="sunk">
          <StageLine stages={stages} current={0} label="Commission progress" />
        </Panel>
      </Section>

      <Section title="Panels">
        <div className="grid gap-4 sm:grid-cols-2">
          <Panel
            title="Commissions are open"
            description="Clients can send you requests from your page."
            actions={<Button variant="secondary" size="sm">Close commissions</Button>}
            headingLevel={3}
          >
            <p>You have 4 requests waiting for a quote.</p>
          </Panel>
          <Panel title="Client's brief" tone="sunk" headingLevel={3}>
            <p>My OC Juniper sitting on a stack of books, cosy autumn colours.</p>
          </Panel>
        </div>
      </Section>

      <Section title="Navigation">
        <Panel tone="sunk">
          <NavPills
            label="Demo"
            items={[
              { href: "/dev/components", label: "Requests" },
              { href: "/dev/types", label: "Commission types" },
              { href: "/dev/portfolio", label: "Portfolio" },
              { href: "/dev/settings", label: "Settings" },
            ]}
          />
        </Panel>
      </Section>

      <Section title="Table">
        <Table caption="Payments for this request">
          <thead>
            <tr>
              <Th>Payment</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th numeric>Amount</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>Deposit</Td>
              <Td><Badge tone="open">Paid</Badge></Td>
              <Td>3 Nov</Td>
              <Td numeric>$42.50</Td>
            </tr>
            <tr>
              <Td>Final payment</Td>
              <Td><Badge tone="warn">Waiting</Badge></Td>
              <Td>—</Td>
              <Td numeric>$42.50</Td>
            </tr>
          </tbody>
        </Table>
      </Section>

      <Section title="Dialogs">
        <ModalDemo />
      </Section>

      <Section title="Toasts">
        <ToastDemo />
      </Section>

      <Section title="Empty, loading and error">
        <div className="grid gap-4 lg:grid-cols-3">
          <EmptyState
            title="No requests yet"
            action={<a href="#main" className={buttonClass("primary", "sm")}>Share your page</a>}
          >
            Requests show up here when a client fills in the form on your page.
          </EmptyState>
          <Panel title="Loading" headingLevel={3}>
            <div className="flex flex-col gap-5">
              <LoadingState label="Loading requests" />
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
              <Spinner label="Uploading image" />
            </div>
          </Panel>
          <ErrorDemo />
        </div>
      </Section>
    </main>
  );
}
