import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");
  const q = searchParams.get("q");
  const nivel = searchParams.get("nivel");

  const where: any = { activa: true };
  if (tipo) where.tipo = tipo;
  if (nivel) where.nivel = parseInt(nivel);
  if (q) {
    where.OR = [
      { codigo: { contains: q } },
      { nombre: { contains: q, mode: "insensitive" } },
    ];
  }

  const cuentas = await prisma.cuentaContable.findMany({
    where,
    orderBy: { codigo: "asc" },
    take: 200,
  });

  return NextResponse.json(cuentas);
}
