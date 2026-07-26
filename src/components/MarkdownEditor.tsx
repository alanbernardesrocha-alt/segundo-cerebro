"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownEditor({
  value,
  onChange,
  onBlurSave,
  placeholder,
  minRows = 10,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlurSave: () => void;
  placeholder?: string;
  minRows?: number;
}) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <div className="rounded-xl border border-[#e7ddc9] bg-white">
      <div className="flex items-center justify-between border-b border-[#efe8da] px-3 py-1.5">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`rounded-md px-2 py-1 text-xs ${
              mode === "edit" ? "bg-[#f1ead9] text-[#2b2620]" : "text-[#a89d86]"
            }`}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`rounded-md px-2 py-1 text-xs ${
              mode === "preview" ? "bg-[#f1ead9] text-[#2b2620]" : "text-[#a89d86]"
            }`}
          >
            Visualizar
          </button>
        </div>
        <span className="text-[11px] text-[#c3b7a2]">Markdown suportado</span>
      </div>
      {mode === "edit" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlurSave}
          placeholder={placeholder}
          rows={minRows}
          className="w-full resize-y rounded-b-xl px-4 py-3 text-sm outline-none"
        />
      ) : (
        <div className="prose-notes min-h-[8rem] px-4 py-3 text-sm">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-[#c3b7a2]">Nada para visualizar ainda.</p>
          )}
        </div>
      )}
    </div>
  );
}
