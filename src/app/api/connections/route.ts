import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  const body = await req.json();
  const sourceId = String(body.sourceId ?? "");
  const targetId = String(body.targetId ?? "");
  const label = typeof body.label === "string" && body.label.trim() ? body.label.trim() : null;

  if (!sourceId || !targetId) {
    return NextResponse.json({ error: "Itens de origem e destino são obrigatórios." }, { status: 400 });
  }
  if (sourceId === targetId) {
    return NextResponse.json({ error: "Um item não pode se conectar a si mesmo." }, { status: 400 });
  }

  const [a, b] = [sourceId, targetId].sort();
  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { sourceId: a, targetId: b },
        { sourceId: b, targetId: a },
      ],
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Esses itens já estão conectados." }, { status: 409 });
  }

  const connection = await prisma.connection.create({
    data: { sourceId, targetId, label },
  });
  return NextResponse.json(connection, { status: 201 });
}
