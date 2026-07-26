"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Modal from "./Modal";
import type { Space } from "@/lib/types";

export default function SpaceActions({ space }: { space: Space }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(space.name);
  const [description, setDescription] = useState(space.description ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/spaces/${space.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Erro ao salvar.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  async function remove() {
    setLoading(true);
    const res = await fetch(`/api/spaces/${space.id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-[#e7ddc9] px-3 py-2 text-sm text-[#4a4436] hover:bg-[#f1ead9]"
      >
        Editar
      </button>
      {open && (
        <Modal title="Editar tema" onClose={() => setOpen(false)}>
          <form onSubmit={save} className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b6558]">Nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[#e7ddc9] bg-white px-3 py-2 text-sm outline-none focus:border-[#8a5a2b]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b6558]">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-[#e7ddc9] bg-white px-3 py-2 text-sm outline-none focus:border-[#8a5a2b]"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="rounded-lg bg-[#2b2620] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Salvar
            </button>

            <div className="mt-2 border-t border-[#efe8da] pt-3">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Excluir este tema e todos os seus itens
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6b6558]">Tem certeza?</span>
                  <button
                    type="button"
                    onClick={remove}
                    disabled={loading}
                    className="rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white"
                  >
                    Sim, excluir
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-[#8a8270]"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
