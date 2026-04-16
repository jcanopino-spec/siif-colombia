import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verificarPermiso } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { cdpSchema } from "@/schemas/presupuesto.schema";
import { crearCDP } from "@/services/presupuesto.service";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vigenciaId = searchParams.get("vigenciaId");
  const estado = searchParams.get("estado");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = {};
  if (vigenciaId) where.vigenciaId = vigenciaId;
  if (estado) where.estado = estado;

  const [cdps, total] = await Promise.all([
    prisma.cDP.findMany({
      where,
      include: {
        items: { include: { rubro: { select: { codigo: true, nombre: true } } } },
        creadoPor: { select: { nombre: true } },
        aprobadoPor: { select: { nombre: true } },
      },
      orderBy: [{ fecha: "desc" }, { numero: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.cDP.count({ where }),
  ]);

  return NextResponse.json({ data: cdps, total, page, limit });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    verificarPermiso(session.user.rol, "cdp:crear");
    const body = await request.json();
    const data = cdpSchema.parse(body);
    const cdp = await crearCDP(data, session.user.id);
    return NextResponse.json(cdp, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
