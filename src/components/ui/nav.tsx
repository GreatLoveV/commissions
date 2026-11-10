"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  href: string;
  label: string;
  // other paths that should also light this item up
  match?: (pathname: string) => boolean;
};

// A row of pill links. The current page gets a filled pill and
// aria-current, so it is clear without relying on colour alone.
export function NavPills({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="-mx-1 overflow-x-auto">
      <ul className="flex w-max gap-1 px-1 py-1">
        {items.map((item) => {
          const current = item.match ? item.match(pathname) : pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors duration-150 ${
                  current ? "bg-ink text-canvas" : "text-muted hover:bg-ink/5 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
