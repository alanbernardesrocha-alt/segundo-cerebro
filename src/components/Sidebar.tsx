import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import NewSpaceButton from "./NewSpaceButton";
import SidebarSearch from "./SidebarSearch";

export default async function Sidebar() {
  const prisma = await getPrisma();
  const spaces = await prisma.space.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[#e7ddc9] bg-[#fdfbf6] px-4 py-5">
      <Link href="/" className="mb-5 flex items-center gap-2 px-1">
        <span className="text-xl">🧠</span>
        <span className="text-base font-semibold tracking-tight">Segundo Cérebro</span>
      </Link>

      <SidebarSearch />

      <nav className="mt-4 flex flex-col gap-0.5 text-sm">
        <Link
          href="/"
          className="rounded-lg px-3 py-2 text-[#4a4436] hover:bg-[#f1ead9]"
        >
          Painel
        </Link>
        <Link
          href="/graph"
          className="rounded-lg px-3 py-2 text-[#4a4436] hover:bg-[#f1ead9]"
        >
          Grafo geral
        </Link>
      </nav>

      <div className="mt-6 flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#9b9280]">
          Temas
        </span>
        <NewSpaceButton />
      </div>

      <div className="mt-1 flex-1 space-y-0.5 overflow-y-auto pb-4 text-sm">
        {spaces.length === 0 && (
          <p className="px-3 py-2 text-xs text-[#9b9280]">
            Nenhum tema ainda. Crie o primeiro para começar a organizar suas notas.
          </p>
        )}
        {spaces.map((space) => (
          <Link
            key={space.id}
            href={`/spaces/${space.slug}`}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-[#4a4436] hover:bg-[#f1ead9]"
          >
            <span className="flex items-center gap-2 truncate">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: space.color }}
              />
              <span className="truncate">{space.name}</span>
            </span>
            <span className="shrink-0 text-xs text-[#a89d86]">{space._count.items}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
