import { notFound } from "next/navigation";
import { getDB, getItemById, getSpaceById, listSpaces, getItemConnectionsExpanded } from "@/lib/db";
import ItemDetailClient from "@/components/ItemDetailClient";
import type { ItemType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ItemPage({ params }: { params: { id: string } }) {
  const db = await getDB();
  const item = await getItemById(db, params.id);
  if (!item) notFound();

  const [space, spaces, connections] = await Promise.all([
    getSpaceById(db, item.spaceId),
    listSpaces(db),
    getItemConnectionsExpanded(db, item.id),
  ]);

  if (!space) notFound();

  return (
    <ItemDetailClient
      item={{
        id: item.id,
        type: item.type as ItemType,
        title: item.title,
        content: item.content,
        url: item.url,
        fileName: item.fileName,
        filePath: item.filePath,
        fileSize: item.fileSize,
        fileMime: item.fileMime,
        spaceId: item.spaceId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }}
      space={space}
      spaces={spaces}
      connections={connections.map((c) => ({
        connectionId: c.connectionId,
        label: c.label,
        item: {
          id: c.item.id,
          title: c.item.title,
          type: c.item.type as ItemType,
          space: c.item.space,
        },
      }))}
    />
  );
}
