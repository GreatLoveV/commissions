// Money is stored as whole minor units (cents, centimes) so there is no
// float rounding. 49.99 USD is stored as 4999.
// Every currency we support has two decimal places.

export function formatMoney(minor: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    // show "50" instead of "50.00", but keep "49.99"
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);
}

// Turns what a person types ("50", "49.99", "49,5") into minor units.
// Returns null when it is not a valid amount.
export function parseMoney(input: string): number | null {
  const match = /^(\d{1,7})(?:[.,](\d{1,2}))?$/.exec(input.trim());
  if (!match) return null;
  const whole = Number(match[1]);
  const fraction = Number((match[2] ?? "").padEnd(2, "0"));
  return whole * 100 + fraction;
}

// For putting a stored amount back into a form field.
export function minorToInput(minor: number) {
  return minor % 100 === 0 ? String(minor / 100) : (minor / 100).toFixed(2);
}
