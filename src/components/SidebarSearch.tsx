"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SidebarSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form onSubmit={submit}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar em tudo..."
        className="w-full rounded-lg border border-[#e7ddc9] bg-white px-3 py-2 text-sm outline-none focus:border-[#8a5a2b]"
      />
    </form>
  );
}
