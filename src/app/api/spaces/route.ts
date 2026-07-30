import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function GET() {
  const prisma = await getPrisma();
  const spaces = await prisma.space.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { items: true } } },
  });
  return NextResponse.json(spaces);
}

export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  const body = (await req.json()) as any;
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Nome do tema é obrigatório." }, { status: 400 });
  }

  const baseSlug = slugify(name) || "tema";
  let slug = baseSlug;
  let attempt = 1;
  while (await prisma.space.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const space = await prisma.space.create({
    data: {
      name,
      slug,
      color: body.color || "#6b6558",
      description: body.description || null,
    },
  });
  return NextResponse.json(space, { status: 201 });
}
