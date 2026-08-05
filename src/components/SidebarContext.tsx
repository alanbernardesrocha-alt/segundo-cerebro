"use client";

import { createContext, useContext, useState } from "react";

type Ctx = { open: boolean; setOpen: (v: boolean | ((o: boolean) => boolean)) => void };
const SidebarCtx = createContext<Ctx>({ open: false, setOpen: () => {} });

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <SidebarCtx.Provider value={{ open, setOpen }}>{children}</SidebarCtx.Provider>;
}

export function useSidebar() {
  return useContext(SidebarCtx);
}
