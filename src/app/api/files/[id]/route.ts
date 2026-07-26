import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/uploads";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const item = await prisma.item.findUnique({ where: { id: params.id } });
  if (!item || !item.filePath) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  const filePath = path.join(UPLOAD_DIR, item.filePath);
  try {
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": item.fileMime || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(
          item.fileName || item.filePath
        )}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado no disco." }, { status: 404 });
  }
}
