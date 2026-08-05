import Link from "next/link";
import { getDB, listSpacesWithCounts, listItems } from "@/lib/db";
import ItemCard from "@/components/ItemCard";

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
    <div className="page-frame mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">

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
                  style={{ borderTop: `4px solid ${space.color}` }}
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

          {/* Conexões neurais — chamada */}
          <section className="mb-10">
            <h2 className="section-rule mb-4 font-stamp text-xs tracking-[0.15em] text-[#8a6f3f]">
              CONEXÕES NEURAIS
            </h2>
            <Link
              href="/graph"
              className="card-vintage flex items-center gap-5 rounded-sm px-5 py-4"
            >
              <svg viewBox="0 0 200 96" className="h-24 w-52 shrink-0" aria-hidden>
                <g stroke="#6b4a2f" strokeWidth="1.4" opacity="0.5">
                  <line x1="46" y1="30" x2="100" y2="20" />
                  <line x1="100" y1="20" x2="150" y2="46" />
                  <line x1="46" y1="30" x2="70" y2="72" />
                  <line x1="70" y1="72" x2="128" y2="76" />
                  <line x1="128" y1="76" x2="150" y2="46" />
                </g>
                <circle cx="46" cy="30" r="9" fill="#b5482d" />
                <circle cx="100" cy="20" r="8" fill="#3e6259" />
                <circle cx="150" cy="46" r="10" fill="#834d5e" />
                <circle cx="70" cy="72" r="7" fill="#46617e" />
                <circle cx="128" cy="76" r="8" fill="#c99a45" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-base font-bold text-[#2b2620]">
                  Veja como suas ideias se ligam
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#6b5c47]">
                  {totalConnections}{" "}
                  {totalConnections === 1 ? "conexão" : "conexões"} entre {totalItems}{" "}
                  {totalItems === 1 ? "item" : "itens"}. As ligações se formam sozinhas quando uma
                  nota cita outra, compartilha tema ou referência.
                </p>
              </div>
              <span className="btn-stamp btn-stamp-outline shrink-0">Abrir o mapa</span>
            </Link>
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
