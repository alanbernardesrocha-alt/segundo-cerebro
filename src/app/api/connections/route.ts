import { NextRequest, NextResponse } from "next/server";
import { getDB, findConnectionBetween, createConnection } from "@/lib/db";

export async function POST(req: NextRequest) {
  const db = await getDB();
  const body = (await req.json()) as any;
  const sourceId = String(body.sourceId ?? "");
  const targetId = String(body.targetId ?? "");
  const label = typeof body.label === "string" && body.label.trim() ? body.label.trim() : null;

  if (!sourceId || !targetId) {
    return NextResponse.json({ error: "Itens de origem e destino são obrigatórios." }, { status: 400 });
  }
  if (sourceId === targetId) {
    return NextResponse.json({ error: "Um item não pode se conectar a si mesmo." }, { status: 400 });
  }

  const existing = await findConnectionBetween(db, sourceId, targetId);
  if (existing) {
    return NextResponse.json({ error: "Esses itens já estão conectados." }, { status: 409 });
  }

  const connection = await createConnection(db, { sourceId, targetId, label });
  return NextResponse.json(connection, { status: 201 });
}
