import { NextRequest, NextResponse } from "next/server";
import { getDB, deleteConnection } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = await getDB();
  await deleteConnection(db, params.id);
  return NextResponse.json({ ok: true });
}
