"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Requests" },
  { href: "/dashboard/types", label: "Commission types" },
  { href: "/dashboard/portfolio", label: "Portfolio" },
  { href: "/dashboard/settings", label: "Settings" },
];

// A client component only because it needs to know the current url.
export function NavLinks() {
  const pathname = usePathname();

  // "Requests" also covers the pages of a single request
  function isCurrent(href: string) {
    if (href === "/dashboard") {
      return pathname === href || pathname.startsWith("/dashboard/requests");
    }
    return pathname.startsWith(href);
  }

  return (
    <nav aria-label="Dashboard" className="flex w-full flex-wrap gap-x-6 gap-y-1 text-sm">
      {links.map((link) => {
        const current = isCurrent(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            // tells screen readers which page this is, the styling shows it to everyone else
            aria-current={current ? "page" : undefined}
            className={
              current
                ? "border-b-2 border-accent py-1 font-medium text-ink"
                : "border-b-2 border-transparent py-1 text-muted hover:text-ink"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
