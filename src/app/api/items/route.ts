import { NextRequest, NextResponse } from "next/server";
import { getDB, listItems, createItem } from "@/lib/db";
import type { ItemType } from "@/lib/types";

export async function GET(req: NextRequest) {
  const db = await getDB();
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get("spaceId") ?? undefined;
  const type = searchParams.get("type") as ItemType | null;

  const items = await listItems(
    db,
    { spaceId: spaceId || undefined, type: type || undefined },
    { orderByUpdatedAt: true }
  );
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const db = await getDB();
  const body = (await req.json()) as any;
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

  const item = await createItem(db, {
    title,
    spaceId,
    type,
    content: body.content ?? null,
    url: type === "LINK" ? String(body.url).trim() : null,
  });
  return NextResponse.json(item, { status: 201 });
}
