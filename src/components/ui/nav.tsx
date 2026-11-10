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
    // on a narrow screen the row scrolls sideways; the fade on the right
    // edge shows there is more
    <nav
      aria-label={label}
      className="-mx-1 overflow-x-auto [mask-image:linear-gradient(to_right,black_85%,transparent)] sm:[mask-image:none]"
    >
      <ul className="flex w-max gap-1 py-1 pr-8 pl-1 sm:pr-1">
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
