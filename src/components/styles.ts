// Class lists shared by buttons, links and inputs, so they look the same
// everywhere and only need changing in one place.

const buttonBase =
  "inline-flex items-center justify-center rounded-sm px-4 py-2 font-medium disabled:opacity-60";

export const buttonPrimary = `${buttonBase} bg-accent text-white hover:bg-accent-strong`;

export const buttonSecondary = `${buttonBase} border border-line bg-sheet text-ink hover:border-ink`;

export const buttonDanger = `${buttonBase} border border-danger bg-sheet text-danger hover:bg-danger hover:text-white`;

export const linkClass = "underline underline-offset-2 hover:text-accent";

export const inputClass =
  "w-full rounded-sm border border-line bg-sheet px-3 py-2 text-ink aria-invalid:border-danger";

// white panel that sits on the grey page background
export const sheetClass = "rounded-sm border border-line bg-sheet";
