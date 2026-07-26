import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { UPLOAD_DIR } from "@/lib/uploads";

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  const spaceId = String(formData.get("spaceId") ?? "");
  const title = String(formData.get("title") ?? "");
  const description = formData.get("description");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo é obrigatório." }, { status: 400 });
  }
  if (!spaceId) {
    return NextResponse.json({ error: "Tema é obrigatório." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Arquivo excede o limite de 25MB." }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name);
  const storedName = `${crypto.randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, storedName), buffer);

  const item = await prisma.item.create({
    data: {
      type: "FILE",
      title: title.trim() || file.name,
      content: typeof description === "string" && description.trim() ? description.trim() : null,
      spaceId,
      fileName: file.name,
      filePath: storedName,
      fileSize: file.size,
      fileMime: file.type || null,
    },
    include: { space: true },
  });

  return NextResponse.json(item, { status: 201 });
}
