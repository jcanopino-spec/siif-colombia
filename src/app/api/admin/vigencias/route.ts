import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado");

  const where: any = {};
  if (estado) where.estado = estado;

  // Filtrar por entidad del usuario
  where.entidadId = (session.user as any).entidadId;

  const vigencias = await prisma.vigencia.findMany({
    where,
    orderBy: { anio: "desc" },
  });

  return NextResponse.json({ data: vigencias });
}
