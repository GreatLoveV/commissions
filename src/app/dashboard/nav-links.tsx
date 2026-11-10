"use client";

import { NavPills, type NavItem } from "@/components/ui/nav";

// "Requests" also covers the pages of a single request. The match
// functions live in a client file because they cannot be passed from a
// server component.
const links: NavItem[] = [
  {
    href: "/dashboard",
    label: "Requests",
    match: (path) => path === "/dashboard" || path.startsWith("/dashboard/requests"),
  },
  { href: "/dashboard/types", label: "Commission types", match: (path) => path.startsWith("/dashboard/types") },
  { href: "/dashboard/portfolio", label: "Portfolio", match: (path) => path.startsWith("/dashboard/portfolio") },
  { href: "/dashboard/settings", label: "Settings", match: (path) => path.startsWith("/dashboard/settings") },
];

export function NavLinks() {
  return <NavPills items={links} label="Dashboard" />;
}
