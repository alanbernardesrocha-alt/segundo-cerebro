"use client";

import { usePathname, useRouter } from "next/navigation";

/** Botão "voltar" global: aparece em qualquer seção (some só no Painel/home). */
export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/") return null;

  return (
    <button
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.back();
        else router.push("/");
      }}
      aria-label="Voltar para a página anterior"
      className="header-back mr-1 flex shrink-0 items-center gap-1.5"
    >
      <span aria-hidden className="text-base leading-none">←</span>
      <span className="hidden sm:inline">Voltar</span>
    </button>
  );
}
