import { prisma } from "@/lib/prisma";
import ItemCard from "@/components/ItemCard";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? "";

  const items = q
    ? await prisma.item.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { content: { contains: q } },
            { fileName: { contains: q } },
          ],
        },
        include: { space: true },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="mb-1 text-2xl font-semibold text-[#2b2620]">Busca</h1>
      <p className="mb-6 text-sm text-[#8a8270]">
        {q ? (
          <>
            {items.length} resultado{items.length === 1 ? "" : "s"} para "{q}"
          </>
        ) : (
          "Digite um termo na barra lateral para buscar em todas as suas notas e referências."
        )}
      </p>

      {q && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#e7ddc9] bg-white/60 px-6 py-10 text-center">
          <p className="text-sm text-[#6b6558]">Nada encontrado.</p>
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
