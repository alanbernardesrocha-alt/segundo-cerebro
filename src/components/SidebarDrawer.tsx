"use client";

import { useSidebar } from "./SidebarContext";

/** Envelope da barra lateral: estática no desktop, gaveta deslizante no mobile. */
export default function SidebarDrawer({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSidebar();
  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-[#1c130b]/50 md:hidden"
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 shrink-0 flex-col overflow-hidden border-r border-[#c9a35f]/40 bg-[#f1e6c9] shadow-2xl transition-transform duration-300 md:static md:z-0 md:h-auto md:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {children}
      </aside>
    </>
  );
}
