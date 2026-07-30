import { NextRequest, NextResponse } from "next/server";
import { getDB, listItems, listConnectionsAmongItems } from "@/lib/db";
import type { GraphData, ItemType } from "@/lib/types";

export async function GET(req: NextRequest) {
  const db = await getDB();
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get("spaceId") ?? undefined;

  const items = await listItems(db, { spaceId });
  const itemIds = items.map((i) => i.id);
  const itemIdSet = new Set(itemIds);

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
    edges: connections
      .filter((c) => itemIdSet.has(c.sourceId) && itemIdSet.has(c.targetId))
      .map((c) => ({
        id: c.id,
        source: c.sourceId,
        target: c.targetId,
        label: c.label,
      })),
  };

  return NextResponse.json(data);
}
