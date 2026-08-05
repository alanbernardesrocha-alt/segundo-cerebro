"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Painel", match: (p: string) => p === "/" },
  { href: "/graph", label: "Conexões neurais", match: (p: string) => p.startsWith("/graph") },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 items-center gap-2 md:flex-none">
      {LINKS.map((l) => {
        const active = l.match(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`header-nav-link ${active ? "header-nav-active" : ""} flex-1 text-center md:flex-none md:text-left`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
