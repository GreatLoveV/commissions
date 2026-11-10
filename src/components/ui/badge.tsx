// Small labels. Colour is never the only signal: the text always says
// the status in words.

const tones = {
  neutral: "bg-sunk text-ink",
  blue: "bg-blueline-soft text-accent-strong",
  pink: "bg-pink-soft text-pink-strong",
  open: "bg-open-soft text-open",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

// The signature piece: a label that looks stuck on, slightly turned,
// with a dot. Used for the one status that matters most on a page,
// like "Open for commissions".
export function Sticker({
  tone = "open",
  children,
}: {
  tone?: "open" | "closed" | "pink";
  children: React.ReactNode;
}) {
  const style = {
    open: { box: "bg-open-soft text-open", dot: "bg-open" },
    closed: { box: "bg-sunk text-muted", dot: "bg-muted" },
    pink: { box: "bg-pink-soft text-pink-strong", dot: "bg-pink-strong" },
  }[tone];

  return (
    <span
      className={`inline-flex -rotate-2 items-center gap-2 rounded-sticker border-2 border-ink px-3 py-1 font-display text-lg font-semibold shadow-[2px_3px_0_var(--color-ink)] ${style.box}`}
    >
      <span aria-hidden="true" className={`size-2.5 rounded-full ${style.dot}`} />
      {children}
    </span>
  );
}
