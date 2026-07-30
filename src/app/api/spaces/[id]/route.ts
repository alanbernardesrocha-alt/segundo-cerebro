import { NextRequest, NextResponse } from "next/server";
import { getDB, updateSpace, deleteSpace } from "@/lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const db = await getDB();
  const body = (await req.json()) as any;
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.color === "string") data.color = body.color;
  if (typeof body.description === "string" || body.description === null)
    data.description = body.description;

  const space = await updateSpace(db, params.id, data);
  return NextResponse.json(space);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = await getDB();
  const { results } = await db
    .prepare(`SELECT "filePath" FROM "Item" WHERE "spaceId" = ? AND "filePath" IS NOT NULL`)
    .bind(params.id)
    .all<{ filePath: string }>();

  await deleteSpace(db, params.id);

  const { env } = await getCloudflareContext({ async: true });
  await Promise.all(
    (results ?? []).map(async (item) => {
      try {
        await env.UPLOADS.delete(item.filePath);
      } catch {
        // arquivo já pode não existir; ignora
      }
    })
  );

  return NextResponse.json({ ok: true });
}
