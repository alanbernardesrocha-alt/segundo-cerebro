import { NextRequest, NextResponse } from "next/server";
import { getDB, getItemById, updateItem, deleteItem, getItemConnectionsExpanded } from "@/lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = await getDB();
  const item = await getItemById(db, params.id);
  if (!item) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  const connections = await getItemConnectionsExpanded(db, params.id);
  return NextResponse.json({ ...item, connections });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const db = await getDB();
  const body = (await req.json()) as any;
  const data: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim();
  if (typeof body.content === "string" || body.content === null) data.content = body.content;
  if (typeof body.url === "string" || body.url === null) data.url = body.url;
  if (typeof body.spaceId === "string") data.spaceId = body.spaceId;

  const item = await updateItem(db, params.id, data);
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = await getDB();
  const item = await getItemById(db, params.id);
  if (!item) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  await deleteItem(db, params.id);

  if (item.filePath) {
    try {
      const { env } = await getCloudflareContext({ async: true });
      await env.UPLOADS.delete(item.filePath);
    } catch {
      // arquivo já pode não existir; ignora
    }
  }

  return NextResponse.json({ ok: true });
}
