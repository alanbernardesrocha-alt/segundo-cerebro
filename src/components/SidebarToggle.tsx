"use client";

import { useSidebar } from "./SidebarContext";

export default function SidebarToggle() {
  const { setOpen } = useSidebar();
  return (
    <button
      onClick={() => setOpen((o) => !o)}
      aria-label="Abrir menu de temas"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#c99a45]/50 text-lg text-[#f6ecd4] transition hover:bg-white/10 md:hidden"
    >
      ☰
    </button>
  );
}
