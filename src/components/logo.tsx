import Link from "next/link";

// The app name with a small mark: a sheet of paper with a pink sticker
// stuck to its corner. "Commissions" is still a placeholder name.
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-control font-display text-xl font-semibold">
      <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8" fill="none">
        <rect x="6" y="4" width="18" height="24" rx="3" transform="rotate(-6 15 16)" fill="#fff" stroke="var(--color-ink)" strokeWidth="2.5" />
        <path d="M10 12h9M10 17h7" transform="rotate(-6 15 16)" stroke="var(--color-blueline)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="23" cy="23" r="6" fill="var(--color-pink)" stroke="var(--color-ink)" strokeWidth="2.5" />
      </svg>
      Commissions
    </Link>
  );
}
