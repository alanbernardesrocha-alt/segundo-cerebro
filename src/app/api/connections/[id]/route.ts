import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.connection.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
