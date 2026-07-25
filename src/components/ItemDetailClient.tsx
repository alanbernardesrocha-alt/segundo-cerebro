"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import MarkdownEditor from "./MarkdownEditor";
import ConnectionsPanel from "./ConnectionsPanel";
import type { ItemType } from "@/lib/types";

type SpaceLite = { id: string; name: string; slug: string; color: string };

type ItemData = {
  id: string;
  type: ItemType;
  title: string;
  content: string | null;
  url: string | null;
  fileName: string | null;
  filePath: string | null;
  fileSize: number | null;
  fileMime: string | null;
  spaceId: string;
  createdAt: string;
  updatedAt: string;
};

export type ConnectedItem = {
  connectionId: string;
  label: string | null;
  item: {
    id: string;
    title: string;
    type: ItemType;
    space: SpaceLite;
  };
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TYPE_ICON: Record<ItemType, string> = { NOTE: "📝", FILE: "📎", LINK: "🔗" };

export default function ItemDetailClient({
  item,
  space,
  spaces,
  connections,
}: {
  item: ItemData;
  space: SpaceLite;
  spaces: SpaceLite[];
  connections: ConnectedItem[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  async function patch(data: Record<string, unknown>) {
    const res = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
      router.refresh();
    }
  }

  async function remove() {
    const res = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
    if (res.ok) router.push(`/spaces/${space.slug}`);
  }

  const isImage = item.fileMime?.startsWith("image/");
  const isPdf = item.fileMime === "application/pdf";

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/spaces/${space.slug}`}
          className="flex items-center gap-1.5 text-sm text-[#8a8270] hover:text-[#4a4436]"
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: space.color }} />
          {space.name}
        </Link>
        <div className="flex items-center gap-2 text-xs">
          {savedFlash && <span className="text-[#5a7d5a]">Salvo</span>}
          <select
            value={item.spaceId}
            onChange={(e) => patch({ spaceId: e.target.value })}
            className="rounded-lg border border-[#e7ddc9] bg-white px-2 py-1.5 text-xs text-[#6b6558] outline-none"
            title="Mover para outro tema"
          >
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg border border-[#e7ddc9] px-2 py-1.5 text-red-600 hover:bg-red-50"
            >
              Excluir
            </button>
          ) : (
            <span className="flex items-center gap-1">
              <button onClick={remove} className="rounded-lg bg-red-600 px-2 py-1.5 text-white">
                Confirmar
              </button>
              <button onClick={() => setConfirmDelete(false)} className="px-1 text-[#8a8270]">
                Cancelar
              </button>
            </span>
          )}
        </div>
      </div>

      <div className="mb-5 flex items-center gap-2">
        <span className="text-2xl">{TYPE_ICON[item.type]}</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && title !== item.title && patch({ title })}
          className="w-full bg-transparent text-2xl font-semibold text-[#2b2620] outline-none"
        />
      </div>

      {item.type === "LINK" && (
        <div className="mb-4 flex flex-col gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => url !== (item.url ?? "") && patch({ url })}
            className="w-full rounded-lg border border-[#e7ddc9] bg-white px-3 py-2 text-sm text-[#4a6fa5] outline-none"
          />
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit rounded-lg bg-[#f1ead9] px-3 py-1.5 text-sm text-[#4a4436] hover:bg-[#e7ddc9]"
            >
              Abrir link ↗
            </a>
          )}
        </div>
      )}

      {item.type === "FILE" && (
        <div className="mb-4 rounded-xl border border-[#e7ddc9] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#2b2620]">{item.fileName}</p>
              <p className="text-xs text-[#a89d86]">
                {item.fileSize ? formatBytes(item.fileSize) : ""} {item.fileMime}
              </p>
            </div>
            <a
              href={`/api/files/${item.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#2b2620] px-3 py-1.5 text-sm text-white hover:bg-[#40392f]"
            >
              Abrir / baixar
            </a>
          </div>
          {isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/files/${item.id}`}
              alt={item.fileName ?? ""}
              className="max-h-96 rounded-lg border border-[#efe8da] object-contain"
            />
          )}
          {isPdf && (
            <iframe src={`/api/files/${item.id}`} className="h-96 w-full rounded-lg border border-[#efe8da]" />
          )}
        </div>
      )}

      <div className="mb-8">
        <p className="mb-1.5 text-xs font-medium text-[#6b6558]">
          {item.type === "NOTE" ? "Conteúdo" : "Notas / descrição"}
        </p>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          onBlurSave={() => content !== (item.content ?? "") && patch({ content })}
          placeholder={
            item.type === "NOTE" ? "Escreva em markdown..." : "Adicione contexto sobre esta referência..."
          }
        />
      </div>

      <ConnectionsPanel itemId={item.id} connections={connections} />

      <p className="mt-8 text-xs text-[#c3b7a2]">
        Criado em {new Date(item.createdAt).toLocaleDateString("pt-BR")} · Atualizado em{" "}
        {new Date(item.updatedAt).toLocaleDateString("pt-BR")}
      </p>
    </div>
  );
}
