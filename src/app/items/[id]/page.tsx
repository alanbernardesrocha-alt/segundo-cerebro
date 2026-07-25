import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ItemDetailClient from "@/components/ItemDetailClient";
import type { ItemType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ItemPage({ params }: { params: { id: string } }) {
  const [item, spaces] = await Promise.all([
    prisma.item.findUnique({
      where: { id: params.id },
      include: {
        space: true,
        connectionsFrom: { include: { target: { include: { space: true } } } },
        connectionsTo: { include: { source: { include: { space: true } } } },
      },
    }),
    prisma.space.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  if (!item) notFound();

  const connections = [
    ...item.connectionsFrom.map((c) => ({
      connectionId: c.id,
      label: c.label,
      item: c.target,
    })),
    ...item.connectionsTo.map((c) => ({
      connectionId: c.id,
      label: c.label,
      item: c.source,
    })),
  ];

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
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }}
      space={item.space}
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
