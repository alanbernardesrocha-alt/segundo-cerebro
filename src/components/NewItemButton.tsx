"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Modal from "./Modal";
import type { Space } from "@/lib/types";

type ItemTypeTab = "NOTE" | "LINK" | "FILE";

const TABS: { key: ItemTypeTab; label: string; icon: string }[] = [
  { key: "NOTE", label: "Anotação", icon: "📝" },
  { key: "LINK", label: "Link", icon: "🔗" },
  { key: "FILE", label: "Arquivo", icon: "📎" },
];

export default function NewItemButton({
  spaces,
  defaultSpaceId,
  label = "+ Novo",
}: {
  spaces: Space[];
  defaultSpaceId?: string;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ItemTypeTab>("NOTE");
  const [spaceId, setSpaceId] = useState(defaultSpaceId || spaces[0]?.id || "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setTab("NOTE");
    setTitle("");
    setContent("");
    setUrl("");
    setFile(null);
    setError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!spaceId) {
      setError("Crie um tema antes de adicionar itens.");
      return;
    }
    setLoading(true);
    setError("");

    let res: Response;
    if (tab === "FILE") {
      if (!file) {
        setLoading(false);
        setError("Selecione um arquivo.");
        return;
      }
      const fd = new FormData();
      fd.append("file", file);
      fd.append("spaceId", spaceId);
      fd.append("title", title);
      fd.append("description", content);
      res = await fetch("/api/upload", { method: "POST", body: fd });
    } else {
      res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tab, title, content, url, spaceId }),
      });
    }

    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as any;
      setError(data.error || "Erro ao criar item.");
      return;
    }
    const item = (await res.json()) as any;
    setOpen(false);
    reset();
    router.push(`/items/${item.id}`);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[#2b2620] px-3 py-2 text-sm font-medium text-white hover:bg-[#40392f]"
      >
        {label}
      </button>
      {open && (
        <Modal title="Novo item" onClose={() => setOpen(false)}>
          <div className="mb-3 flex gap-1 rounded-lg bg-[#f1ead9] p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex-1 rounded-md px-2 py-1.5 text-sm ${
                  tab === t.key ? "bg-white shadow-sm" : "text-[#8a8270]"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            {spaces.length > 0 ? (
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6b6558]">Tema</label>
                <select
                  value={spaceId}
                  onChange={(e) => setSpaceId(e.target.value)}
                  className="w-full rounded-lg border border-[#e7ddc9] bg-white px-3 py-2 text-sm outline-none focus:border-[#8a5a2b]"
                >
                  {spaces.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-xs text-red-600">
                Crie um tema na barra lateral antes de adicionar itens.
              </p>
            )}

            {tab === "FILE" ? (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6b6558]">Arquivo</label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="w-full rounded-lg border border-[#e7ddc9] bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#f1ead9] file:px-2 file:py-1 file:text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6b6558]">
                    Título (opcional)
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={file?.name || "Nome do arquivo será usado"}
                    className="w-full rounded-lg border border-[#e7ddc9] bg-white px-3 py-2 text-sm outline-none focus:border-[#8a5a2b]"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6b6558]">Título</label>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-[#e7ddc9] bg-white px-3 py-2 text-sm outline-none focus:border-[#8a5a2b]"
                />
              </div>
            )}

            {tab === "LINK" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6b6558]">URL</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-[#e7ddc9] bg-white px-3 py-2 text-sm outline-none focus:border-[#8a5a2b]"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b6558]">
                {tab === "NOTE" ? "Conteúdo (markdown)" : "Descrição (opcional)"}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={tab === "NOTE" ? 6 : 3}
                className="w-full resize-none rounded-lg border border-[#e7ddc9] bg-white px-3 py-2 text-sm outline-none focus:border-[#8a5a2b]"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading || !spaceId}
              className="mt-1 rounded-lg bg-[#2b2620] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
