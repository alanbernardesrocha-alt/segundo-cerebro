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
    <div className="page-frame mx-auto max-w-5xl px-8 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full border border-[#6B4A2F]/30"
              style={{ backgroundColor: space.color }}
            />
            <h1 className="text-3xl font-bold text-[#2b2620]">{space.name}</h1>
          </div>
          {space.description && (
            <p className="mt-1 max-w-xl text-sm text-[#6b5c47]">{space.description}</p>
          )}
          <p className="mt-1 font-stamp text-xs text-[#8a6f3f]">
            {items.length} {items.length === 1 ? "item" : "itens"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/graph?spaceId=${space.id}`} className="btn-stamp btn-stamp-outline">
            Ver conexões
          </Link>
          <NewItemButton spaces={allSpaces} defaultSpaceId={space.id} />
          <SpaceActions space={space} />
        </div>
      </header>

      {items.length === 0 ? (
        <div className="card-vintage rounded-sm border-dashed px-6 py-10 text-center">
          <p className="text-sm text-[#6b5c47]">
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
