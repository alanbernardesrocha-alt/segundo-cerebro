import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = await getPrisma();
  await prisma.connection.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
