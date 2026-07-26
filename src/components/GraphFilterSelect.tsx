"use client";

import { useRouter } from "next/navigation";
import type { Space } from "@/lib/types";

export default function GraphFilterSelect({
  spaces,
  spaceId,
}: {
  spaces: Space[];
  spaceId?: string;
}) {
  const router = useRouter();

  return (
    <select
      value={spaceId ?? ""}
      onChange={(e) =>
        router.push(e.target.value ? `/graph?spaceId=${e.target.value}` : "/graph")
      }
      className="rounded-lg border border-[#e7ddc9] bg-white px-3 py-2 text-sm text-[#4a4436] outline-none"
    >
      <option value="">Todos os temas</option>
      {spaces.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
