"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Modal from "./Modal";

const COLORS = ["#8a5a2b", "#5a7d5a", "#4a6fa5", "#a54a6f", "#9b7a3a", "#6b6558"];

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
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao criar tema.");
      return;
    }
    const space = await res.json();
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
        className="rounded-full px-2 py-1 text-sm text-[#8a5a2b] hover:bg-[#f1ead9]"
        aria-label="Novo tema"
        title="Novo tema"
      >
        +
      </button>
      {open && (
        <Modal title="Novo tema" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b6558]">Nome</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Filosofia, Projetos, Saúde..."
                className="w-full rounded-lg border border-[#e7ddc9] bg-white px-3 py-2 text-sm outline-none focus:border-[#8a5a2b]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b6558]">
                Descrição (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-[#e7ddc9] bg-white px-3 py-2 text-sm outline-none focus:border-[#8a5a2b]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b6558]">Cor</label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className="h-6 w-6 rounded-full ring-offset-2"
                    style={{
                      backgroundColor: c,
                      boxShadow: color === c ? `0 0 0 2px ${c}` : undefined,
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
              className="mt-1 rounded-lg bg-[#2b2620] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Criando..." : "Criar tema"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
