import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/uploads";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.color === "string") data.color = body.color;
  if (typeof body.description === "string" || body.description === null)
    data.description = body.description;

  const space = await prisma.space.update({ where: { id: params.id }, data });
  return NextResponse.json(space);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const items = await prisma.item.findMany({
    where: { spaceId: params.id, filePath: { not: null } },
    select: { filePath: true },
  });

  await prisma.space.delete({ where: { id: params.id } });

  await Promise.all(
    items.map(async (item) => {
      if (!item.filePath) return;
      try {
        await unlink(path.join(UPLOAD_DIR, item.filePath));
      } catch {
        // arquivo já pode não existir; ignora
      }
    })
  );

  return NextResponse.json({ ok: true });
}
