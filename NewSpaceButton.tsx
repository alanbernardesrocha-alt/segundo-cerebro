"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Modal from "./Modal";

// Paleta ampliada do Gabinete Cerebral (vintage, além do marrom)
const COLORS = [
  "#b5482d", // terracota
  "#3e6259", // musgo
  "#834d5e", // ameixa
  "#46617e", // azul-aço
  "#c99a45", // latão
  "#74743e", // oliva
  "#6b4a2f", // sépia
];

export default function NewSpaceButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/spaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, color }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as any;
      setError(data.error || "Erro ao criar tema.");
      return;
    }
    const space = (await res.json()) as any;
    setOpen(false);
    setName("");
    setDescription("");
    router.push(`/spaces/${space.slug}`);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-6 w-6 items-center justify-center rounded-full border border-[#6B4A2F]/40 text-sm text-[#6B4A2F] transition hover:bg-[#c99a45]/20"
        aria-label="Novo tema"
        title="Novo tema"
      >
        +
      </button>
      {open && (
        <Modal title="Novo tema" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block font-stamp text-[10px] uppercase tracking-[0.1em] text-[#8a6f3f]">
                Nome
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Filosofia, Projetos, Saúde..."
                className="w-full rounded-sm border border-[#6B4A2F]/40 bg-[#fffdf6] px-3 py-2 text-sm outline-none focus:border-[#c99a45] focus:shadow-[0_0_0_2px_rgba(201,154,69,0.2)]"
              />
            </div>
            <div>
              <label className="mb-1 block font-stamp text-[10px] uppercase tracking-[0.1em] text-[#8a6f3f]">
                Descrição (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-sm border border-[#6B4A2F]/40 bg-[#fffdf6] px-3 py-2 text-sm outline-none focus:border-[#c99a45] focus:shadow-[0_0_0_2px_rgba(201,154,69,0.2)]"
              />
            </div>
            <div>
              <label className="mb-1 block font-stamp text-[10px] uppercase tracking-[0.1em] text-[#8a6f3f]">
                Cor
              </label>
              <div className="flex gap-2.5">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className="h-6 w-6 rounded-full transition"
                    style={{
                      backgroundColor: c,
                      boxShadow:
                        color === c
                          ? `0 0 0 2px #fdf8ec, 0 0 0 4px ${c}`
                          : "0 0 0 1px rgba(107,74,47,0.25)",
                    }}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-stamp mt-1 w-fit disabled:opacity-50"
            >
              {loading ? "Criando..." : "Criar tema"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
