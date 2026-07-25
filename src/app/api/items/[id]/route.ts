import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: {
      space: true,
      connectionsFrom: { include: { target: { include: { space: true } } } },
      connectionsTo: { include: { source: { include: { space: true } } } },
    },
  });
  if (!item) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim();
  if (typeof body.content === "string" || body.content === null) data.content = body.content;
  if (typeof body.url === "string" || body.url === null) data.url = body.url;
  if (typeof body.spaceId === "string") data.spaceId = body.spaceId;

  const item = await prisma.item.update({
    where: { id: params.id },
    data,
    include: { space: true },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const item = await prisma.item.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  await prisma.item.delete({ where: { id: params.id } });

  if (item.filePath) {
    try {
      await unlink(path.join(process.cwd(), "uploads", item.filePath));
    } catch {
      // arquivo já pode não existir; ignora
    }
  }

  return NextResponse.json({ ok: true });
}
