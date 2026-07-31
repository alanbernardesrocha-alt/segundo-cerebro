import { getDB, searchItems } from "@/lib/db";
import ItemCard from "@/components/ItemCard";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const db = await getDB();
  const q = searchParams.q?.trim() ?? "";

  const items = q ? await searchItems(db, q, undefined, 200) : [];

  return (
    <div className="page-frame mx-auto max-w-5xl px-8 py-10">
      <h1 className="mb-1 text-3xl font-bold text-[#2b2620]">Busca</h1>
      <p className="mb-6 font-stamp text-xs text-[#8a6f3f]">
        {q ? (
          <>
            {items.length} resultado{items.length === 1 ? "" : "s"} para "{q}"
          </>
        ) : (
          "Digite um termo na barra lateral para buscar em todas as suas notas e referências."
        )}
      </p>

      {q && items.length === 0 && (
        <div className="card-vintage rounded-sm border-dashed px-6 py-10 text-center">
          <p className="text-sm text-[#6b5c47]">Nada encontrado.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} showSpace />
        ))}
      </div>
    </div>
  );
}
