// Class lists shared by buttons, links, inputs and panels, so they look
// the same everywhere and only need changing in one place.
//
// Sizes are separate from variants so a call site never has to override
// padding with a second class (two padding classes fight each other).

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap " +
  "transition-[background-color,border-color,color,transform] duration-150 ease-out-soft " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-55";

export const buttonSizes = {
  sm: "min-h-9 px-4 text-sm",
  md: "min-h-11 px-5",
  lg: "min-h-13 px-7 text-lg",
} as const;

export const buttonVariants = {
  // ink text on blue pencil: the one thing to press on a screen
  primary: "bg-blueline text-ink hover:bg-blueline-soft",
  secondary: "border-2 border-ink/15 bg-sheet text-ink hover:border-ink",
  // dark pill, for the call to action in the site header
  ink: "bg-ink text-canvas hover:bg-ink/85",
  ghost: "text-ink hover:bg-ink/5",
  danger: "border-2 border-danger/30 bg-sheet text-danger hover:border-danger hover:bg-danger-soft",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return `${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]}`;
}

// the names the pages already use
export const buttonPrimary = buttonClass("primary");
export const buttonSecondary = buttonClass("secondary");
export const buttonDanger = buttonClass("danger");

export const linkClass =
  "font-medium text-accent underline decoration-accent/40 decoration-2 underline-offset-3 hover:decoration-accent";

export const inputClass =
  "w-full rounded-control border-2 border-line-strong bg-sheet px-3.5 py-2.5 text-ink " +
  "placeholder:text-muted/80 transition-colors duration-150 hover:border-ink " +
  "focus-visible:border-accent focus-visible:outline-accent/30 focus-visible:outline-4 focus-visible:outline-offset-0 " +
  "aria-invalid:border-danger disabled:bg-sunk disabled:text-muted";

// white panel that sits on the paper background
export const sheetClass = "rounded-panel border border-line bg-sheet";

// file pickers: the browser's button gets the secondary button look, and
// the whole picker sits in a dashed "drop your sketch here" box
export const fileInputClass =
  "w-full cursor-pointer rounded-control border-2 border-dashed border-blueline bg-sheet p-3 text-sm text-muted " +
  "file:mr-3 file:cursor-pointer file:rounded-full file:border-2 file:border-ink/15 file:bg-sheet file:px-4 file:py-2 " +
  "file:font-semibold file:text-ink hover:file:border-ink aria-invalid:border-danger";
