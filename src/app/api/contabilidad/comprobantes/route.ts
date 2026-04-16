import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verificarPermiso } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { comprobanteSchema } from "@/schemas/contabilidad.schema";
import { crearComprobante } from "@/services/contabilidad.service";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vigenciaId = searchParams.get("vigenciaId");
  const estado = searchParams.get("estado");
  const tipo = searchParams.get("tipo");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = {};
  if (vigenciaId) where.vigenciaId = vigenciaId;
  if (estado) where.estado = estado;
  if (tipo) where.tipo = tipo;

  const [comprobantes, total] = await Promise.all([
    prisma.comprobante.findMany({
      where,
      include: {
        creadoPor: { select: { nombre: true } },
        aprobadoPor: { select: { nombre: true } },
        movimientos: {
          include: {
            cuenta: { select: { codigo: true, nombre: true } },
            tercero: { select: { nombreCompleto: true } },
          },
        },
      },
      orderBy: [{ fecha: "desc" }, { numero: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.comprobante.count({ where }),
  ]);

  return NextResponse.json({ data: comprobantes, total, page, limit });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    verificarPermiso(session.user.rol, "comprobante:crear");
    const body = await request.json();
    const data = comprobanteSchema.parse(body);
    const comprobante = await crearComprobante(data, session.user.id);
    return NextResponse.json(comprobante, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
