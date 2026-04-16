import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verificarPermiso } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { pagoSchema } from "@/schemas/tesoreria.schema";
import { crearPago } from "@/services/tesoreria.service";

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

  const [pagos, total] = await Promise.all([
    prisma.pago.findMany({
      where,
      include: {
        rp: { select: { numero: true } },
        tercero: { select: { nombreCompleto: true, numeroDocumento: true } },
        cuentaBancaria: { select: { banco: true, numeroCuenta: true } },
        creadoPor: { select: { nombre: true } },
        retenciones: { include: { tipoRetencion: { select: { nombre: true } } } },
      },
      orderBy: [{ fecha: "desc" }, { numero: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pago.count({ where }),
  ]);

  return NextResponse.json({ data: pagos, total, page, limit });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    verificarPermiso(session.user.rol, "pago:crear");
    const body = await request.json();
    const data = pagoSchema.parse(body);
    const pago = await crearPago(data, session.user.id);
    return NextResponse.json(pago, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
