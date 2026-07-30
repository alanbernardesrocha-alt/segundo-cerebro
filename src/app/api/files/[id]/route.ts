import { NextRequest, NextResponse } from "next/server";
import { getDB, getItemById } from "@/lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = await getDB();
  const item = await getItemById(db, params.id);
  if (!item || !item.filePath) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const obj = await env.UPLOADS.get(item.filePath);
  if (!obj) {
    return NextResponse.json({ error: "Arquivo não encontrado no bucket." }, { status: 404 });
  }

  return new NextResponse(obj.body as unknown as BodyInit, {
    headers: {
      "Content-Type": item.fileMime || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(
        item.fileName || item.filePath
      )}"`,
    },
  });
}
