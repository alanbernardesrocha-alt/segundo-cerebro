"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ConnectedItem } from "./ItemDetailClient";
import type { ItemType } from "@/lib/types";

const TYPE_ICON: Record<ItemType, string> = { NOTE: "📝", FILE: "📎", LINK: "🔗" };

type SearchResult = {
  id: string;
  title: string;
  type: ItemType;
  space: { name: string; color: string };
};

export default function ConnectionsPanel({
  itemId,
  connections,
}: {
  itemId: string;
  connections: ConnectedItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query.trim())}&excludeId=${itemId}`
      );
      if (res.ok) setResults(await res.json());
    }, 250);
    return () => clearTimeout(handle);
  }, [query, itemId]);

  const connectedIds = new Set(connections.map((c) => c.item.id));

  async function connect(targetId: string) {
    setAdding(targetId);
    setError("");
    const res = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId: itemId, targetId }),
    });
    setAdding(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao conectar.");
      return;
    }
    setQuery("");
    setResults([]);
    router.refresh();
  }

  async function disconnect(connectionId: string) {
    const res = await fetch(`/api/connections/${connectionId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-[#6b6558]">
        Conexões {connections.length > 0 && `(${connections.length})`}
      </p>

      {connections.length > 0 && (
        <ul className="mb-3 flex flex-col gap-1.5">
          {connections.map((c) => (
            <li
              key={c.connectionId}
              className="flex items-center justify-between gap-2 rounded-lg border border-[#e7ddc9] bg-white px-3 py-2 text-sm"
            >
              <Link href={`/items/${c.item.id}`} className="flex min-w-0 items-center gap-2">
                <span>{TYPE_ICON[c.item.type]}</span>
                <span className="truncate text-[#2b2620]">{c.item.title}</span>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[11px] text-white"
                  style={{ backgroundColor: c.item.space.color }}
                >
                  {c.item.space.name}
                </span>
              </Link>
              <button
                onClick={() => disconnect(c.connectionId)}
                className="shrink-0 text-xs text-[#a89d86] hover:text-red-600"
                title="Remover conexão"
              >
                remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar item para conectar..."
          className="w-full rounded-lg border border-[#e7ddc9] bg-white px-3 py-2 text-sm outline-none focus:border-[#8a5a2b]"
        />
        {results.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-[#e7ddc9] bg-white shadow-md">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => connect(r.id)}
                  disabled={connectedIds.has(r.id) || adding === r.id}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f1ead9] disabled:opacity-40"
                >
                  <span>{TYPE_ICON[r.type]}</span>
                  <span className="truncate">{r.title}</span>
                  <span
                    className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] text-white"
                    style={{ backgroundColor: r.space.color }}
                  >
                    {r.space.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
