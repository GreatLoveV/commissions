// Small drawings for empty and error states. Thick round ink lines with
// flat fills, like stickers in a sketchbook. All decoration: hidden from
// screen readers, the text next to them carries the meaning.

type DoodleProps = { className?: string };

const ink = "var(--color-ink)";

export function BlankSheet({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true" className={className} fill="none">
      {/* sheet, slightly turned like it was dropped on the desk */}
      <g transform="rotate(-6 60 50)">
        <rect x="30" y="12" width="56" height="74" rx="6" fill="#fff" stroke={ink} strokeWidth="3.5" />
        {/* blue pencil guide lines, not yet inked */}
        <path d="M40 30h36M40 42h28M40 54h32" stroke="var(--color-blueline)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6 6" />
      </g>
      {/* pencil */}
      <g transform="rotate(35 92 64)">
        <rect x="86" y="34" width="12" height="42" rx="2" fill="var(--color-blueline)" stroke={ink} strokeWidth="3.5" />
        <path d="M86 76l6 12 6-12z" fill="#fff" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
        <rect x="86" y="28" width="12" height="8" rx="2" fill="var(--color-pink)" stroke={ink} strokeWidth="3.5" />
      </g>
      {/* sparkle */}
      <path d="M18 22l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="var(--color-pink)" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

export function BrokenPencil({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true" className={className} fill="none">
      <g transform="rotate(-20 40 50)">
        <rect x="14" y="44" width="40" height="14" rx="2" fill="var(--color-blueline)" stroke={ink} strokeWidth="3.5" />
        <rect x="6" y="44" width="10" height="14" rx="2" fill="var(--color-pink)" stroke={ink} strokeWidth="3.5" />
        <path d="M54 44l5 4-4 3 4 3-5 4" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      </g>
      <g transform="rotate(14 84 54)">
        <path d="M66 46l5 4-4 3 4 3-5 4h22V46z" fill="var(--color-blueline)" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M88 46l14 7-14 7z" fill="#fff" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      </g>
      {/* little shock marks */}
      <path d="M58 22l2 10M70 18l-1 12M46 26l5 8" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

// hand drawn underline for one heading on a page, drawn in blue pencil
export function Scribble({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true" className={className} fill="none">
      <path
        d="M3 9c30-6 60-7 96-4s70 2 98-3"
        stroke="var(--color-blueline)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
