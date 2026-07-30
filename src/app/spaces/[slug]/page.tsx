import { notFound } from "next/navigation";
import Link from "next/link";
import { getDB, getSpaceBySlug, listItems, listSpaces } from "@/lib/db";
import ItemCard from "@/components/ItemCard";
import NewItemButton from "@/components/NewItemButton";
import SpaceActions from "@/components/SpaceActions";

export const dynamic = "force-dynamic";

export default async function SpacePage({ params }: { params: { slug: string } }) {
  const db = await getDB();
  const space = await getSpaceBySlug(db, params.slug);
  if (!space) notFound();

  const [items, allSpaces] = await Promise.all([
    listItems(db, { spaceId: space.id }, { orderByUpdatedAt: true }),
    listSpaces(db),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: space.color }} />
            <h1 className="text-2xl font-semibold text-[#2b2620]">{space.name}</h1>
          </div>
          {space.description && (
            <p className="mt-1 max-w-xl text-sm text-[#8a8270]">{space.description}</p>
          )}
          <p className="mt-1 text-sm text-[#a89d86]">
            {items.length} {items.length === 1 ? "item" : "itens"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/graph?spaceId=${space.id}`}
            className="rounded-lg border border-[#e7ddc9] px-3 py-2 text-sm text-[#4a4436] hover:bg-[#f1ead9]"
          >
            Ver grafo
          </Link>
          <NewItemButton spaces={allSpaces} defaultSpaceId={space.id} />
          <SpaceActions space={space} />
        </div>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e7ddc9] bg-white/60 px-6 py-10 text-center">
          <p className="text-sm text-[#6b6558]">
            Nenhum item neste tema ainda. Adicione uma anotação, um link ou um arquivo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
