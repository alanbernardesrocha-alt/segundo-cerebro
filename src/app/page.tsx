import Link from "next/link";
import { getDB, listSpacesWithCounts, listItems } from "@/lib/db";
import ItemCard from "@/components/ItemCard";
import NewItemButton from "@/components/NewItemButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const db = await getDB();
  const [spaces, recentItems, connectionCountRow] = await Promise.all([
    listSpacesWithCounts(db),
    listItems(db, {}, { orderByUpdatedAt: true, limit: 8 }),
    db.prepare(`SELECT COUNT(*) as count FROM "Connection"`).first<{ count: number }>(),
  ]);
  const totalConnections = connectionCountRow?.count ?? 0;

  const totalItems = spaces.reduce((sum, s) => sum + s.itemCount, 0);

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#2b2620]">Seu segundo cérebro</h1>
          <p className="mt-1 text-sm text-[#8a8270]">
            {totalItems} {totalItems === 1 ? "item" : "itens"} · {spaces.length}{" "}
            {spaces.length === 1 ? "tema" : "temas"} · {totalConnections}{" "}
            {totalConnections === 1 ? "conexão" : "conexões"}
          </p>
        </div>
        <NewItemButton spaces={spaces} />
      </header>

      {spaces.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e7ddc9] bg-white/60 px-6 py-10 text-center">
          <p className="text-sm text-[#6b6558]">
            Comece criando um tema na barra lateral (ex: "Filosofia", "Projetos", "Saúde") para
            organizar suas anotações e referências.
          </p>
        </div>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9b9280]">
              Temas
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {spaces.map((space) => (
                <Link
                  key={space.id}
                  href={`/spaces/${space.slug}`}
                  className="flex flex-col gap-2 rounded-xl border border-[#e7ddc9] bg-white px-4 py-4 transition hover:border-[#c3b7a2] hover:shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: space.color }}
                    />
                    <span className="font-medium text-[#2b2620]">{space.name}</span>
                  </span>
                  {space.description && (
                    <p className="line-clamp-2 text-xs text-[#8a8270]">{space.description}</p>
                  )}
                  <span className="text-xs text-[#a89d86]">
                    {space.itemCount} {space.itemCount === 1 ? "item" : "itens"}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9b9280]">
              Atividade recente
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recentItems.map((item) => (
                <ItemCard key={item.id} item={item} showSpace />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
