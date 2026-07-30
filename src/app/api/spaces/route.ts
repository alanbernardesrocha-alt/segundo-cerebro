import { NextRequest, NextResponse } from "next/server";
import { getDB, listSpacesWithCounts, getSpaceBySlug, createSpace } from "@/lib/db";
import { slugify } from "@/lib/slug";

export async function GET() {
  const db = await getDB();
  const spaces = await listSpacesWithCounts(db);
  return NextResponse.json(spaces);
}

export async function POST(req: NextRequest) {
  const db = await getDB();
  const body = (await req.json()) as any;
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Nome do tema é obrigatório." }, { status: 400 });
  }

  const baseSlug = slugify(name) || "tema";
  let slug = baseSlug;
  let attempt = 1;
  while (await getSpaceBySlug(db, slug)) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const space = await createSpace(db, {
    name,
    slug,
    color: body.color || "#6b6558",
    description: body.description || null,
  });
  return NextResponse.json(space, { status: 201 });
}
