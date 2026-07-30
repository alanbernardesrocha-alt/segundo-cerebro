import { getDB, listSpaces, listItems, listConnectionsAmongItems } from "@/lib/db";
import GraphView from "@/components/GraphView";
import GraphFilterSelect from "@/components/GraphFilterSelect";
import type { GraphData, ItemType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function GraphPage({
  searchParams,
}: {
  searchParams: { spaceId?: string };
}) {
  const db = await getDB();
  const spaceId = searchParams.spaceId;

  const [spaces, items] = await Promise.all([
    listSpaces(db),
    listItems(db, { spaceId }),
  ]);

  const itemIds = items.map((i) => i.id);
  const connections = await listConnectionsAmongItems(db, itemIds);

  const data: GraphData = {
    nodes: items.map((i) => ({
      id: i.id,
      title: i.title,
      type: i.type as ItemType,
      spaceId: i.spaceId,
      spaceName: i.space.name,
      spaceColor: i.space.color,
    })),
    edges: connections.map((c) => ({
      id: c.id,
      source: c.sourceId,
      target: c.targetId,
      label: c.label,
    })),
  };

  const activeSpace = spaces.find((s) => s.id === spaceId);

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#2b2620]">
            Grafo {activeSpace ? `· ${activeSpace.name}` : "geral"}
          </h1>
          <p className="mt-1 text-sm text-[#8a8270]">
            {data.nodes.length} itens · {data.edges.length} conexões. Arraste os nós para
            reorganizar, clique para abrir.
          </p>
        </div>
        <GraphFilterSelect spaces={spaces} spaceId={spaceId} />
      </header>

      <GraphView data={data} />

      {spaces.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {spaces.map((s) => (
            <span key={s.id} className="flex items-center gap-1.5 text-xs text-[#6b6558]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
