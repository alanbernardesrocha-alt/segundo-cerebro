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
    <div className="page-frame mx-auto max-w-5xl px-8 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2b2620]">Seu segundo cérebro</h1>
          <p className="mt-1 font-stamp text-xs tracking-wide text-[#8a6f3f]">
            {totalItems} {totalItems === 1 ? "item" : "itens"} · {spaces.length}{" "}
            {spaces.length === 1 ? "tema" : "temas"} · {totalConnections}{" "}
            {totalConnections === 1 ? "conexão" : "conexões"}
          </p>
        </div>
        <NewItemButton spaces={spaces} />
      </header>

      {spaces.length === 0 ? (
        <div className="card-vintage rounded-sm border-dashed px-6 py-10 text-center">
          <p className="text-sm text-[#6b5c47]">
            Comece criando um tema na barra lateral (ex: "Filosofia", "Projetos", "Saúde") para
            organizar suas anotações e referências.
          </p>
        </div>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="section-rule mb-4 font-stamp text-xs tracking-[0.15em] text-[#8a6f3f]">
              TEMAS
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {spaces.map((space) => (
                <Link
                  key={space.id}
                  href={`/spaces/${space.slug}`}
                  className="card-vintage flex flex-col gap-2 rounded-sm px-4 py-4"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full border border-[#6B4A2F]/30"
                      style={{ backgroundColor: space.color }}
                    />
                    <span className="font-serif font-bold text-[#2b2620]">{space.name}</span>
                  </span>
                  {space.description && (
                    <p className="line-clamp-2 text-xs text-[#6b5c47]">{space.description}</p>
                  )}
                  <span className="font-stamp text-[10px] text-[#8a6f3f]">
                    {space.itemCount} {space.itemCount === 1 ? "item" : "itens"}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="section-rule mb-4 font-stamp text-xs tracking-[0.15em] text-[#8a6f3f]">
              ATIVIDADE RECENTE
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
