import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import type { GraphData, ItemType } from "@/lib/types";

export async function GET(req: NextRequest) {
  const prisma = await getPrisma();
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get("spaceId") ?? undefined;

  const items = await prisma.item.findMany({
    where: spaceId ? { spaceId } : undefined,
    include: { space: true },
  });
  const itemIds = new Set(items.map((i) => i.id));

  const connections = await prisma.connection.findMany({
    where: spaceId
      ? { sourceId: { in: [...itemIds] }, targetId: { in: [...itemIds] } }
      : undefined,
  });

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
      .filter((c) => itemIds.has(c.sourceId) && itemIds.has(c.targetId))
      .map((c) => ({
        id: c.id,
        source: c.sourceId,
        target: c.targetId,
        label: c.label,
      })),
  };

  return NextResponse.json(data);
}
