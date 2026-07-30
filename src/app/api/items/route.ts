import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import type { ItemType } from "@/lib/types";

export async function GET(req: NextRequest) {
  const prisma = await getPrisma();
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get("spaceId") ?? undefined;
  const type = searchParams.get("type") as ItemType | null;

  const items = await prisma.item.findMany({
    where: {
      spaceId: spaceId || undefined,
      type: type || undefined,
    },
    include: { space: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  const body = await req.json();
  const title = String(body.title ?? "").trim();
  const spaceId = String(body.spaceId ?? "");
  const type = (body.type as ItemType) ?? "NOTE";

  if (!title) return NextResponse.json({ error: "Título é obrigatório." }, { status: 400 });
  if (!spaceId) return NextResponse.json({ error: "Tema é obrigatório." }, { status: 400 });
  if (!["NOTE", "FILE", "LINK"].includes(type))
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });

  if (type === "LINK" && !String(body.url ?? "").trim()) {
    return NextResponse.json({ error: "URL é obrigatória para um link." }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: {
      title,
      spaceId,
      type,
      content: body.content ?? null,
      url: type === "LINK" ? String(body.url).trim() : null,
    },
    include: { space: true },
  });
  return NextResponse.json(item, { status: 201 });
}
