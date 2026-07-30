import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const prisma = await getPrisma();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const excludeId = searchParams.get("excludeId") ?? undefined;

  if (!q) return NextResponse.json([]);

  const items = await prisma.item.findMany({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      OR: [
        { title: { contains: q } },
        { content: { contains: q } },
        { fileName: { contains: q } },
      ],
    },
    include: { space: true },
    orderBy: { updatedAt: "desc" },
    take: 25,
  });
  return NextResponse.json(items);
}
