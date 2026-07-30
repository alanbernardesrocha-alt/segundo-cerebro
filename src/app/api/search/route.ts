import { NextRequest, NextResponse } from "next/server";
import { getDB, searchItems } from "@/lib/db";

export async function GET(req: NextRequest) {
  const db = await getDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const excludeId = searchParams.get("excludeId") ?? undefined;

  if (!q) return NextResponse.json([]);

  const items = await searchItems(db, q, excludeId, 25);
  return NextResponse.json(items);
}
