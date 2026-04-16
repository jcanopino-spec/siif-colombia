import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verificarPermiso } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { aprobarPago } from "@/services/tesoreria.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const pago = await prisma.pago.findUnique({
    where: { id },
    include: {
      rp: { select: { numero: true, objeto: true } },
      tercero: true,
      cuentaBancaria: true,
      creadoPor: { select: { nombre: true } },
      aprobadoPor: { select: { nombre: true } },
      retenciones: { include: { tipoRetencion: true } },
      comprobante: { select: { id: true, numero: true, tipo: true } },
    },
  });

  if (!pago) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(pago);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  try {
    if (body.accion === "enviar") {
      const pago = await prisma.pago.findUnique({ where: { id } });
      if (!pago || pago.estado !== "BORRADOR") {
        return NextResponse.json({ error: "Solo borradores se pueden enviar" }, { status: 400 });
      }
      const result = await prisma.pago.update({
        where: { id },
        data: { estado: "PENDIENTE_APROBACION" },
      });
      return NextResponse.json(result);
    }

    if (body.accion === "aprobar") {
      verificarPermiso(session.user.rol, "pago:aprobar");
      const result = await aprobarPago(id, session.user.id);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
