import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verificarPermiso } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { aprobarRP } from "@/services/presupuesto.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const rp = await prisma.rP.findUnique({
    where: { id },
    include: {
      items: { include: { rubro: true } },
      cdp: { select: { numero: true, objeto: true } },
      tercero: true,
      creadoPor: { select: { nombre: true } },
      aprobadoPor: { select: { nombre: true } },
      pagos: { select: { id: true, numero: true, valor: true, estado: true } },
    },
  });

  if (!rp) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(rp);
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
      const rp = await prisma.rP.findUnique({ where: { id } });
      if (!rp || rp.estado !== "BORRADOR") {
        return NextResponse.json({ error: "Solo borradores se pueden enviar" }, { status: 400 });
      }
      const result = await prisma.rP.update({
        where: { id },
        data: { estado: "PENDIENTE_APROBACION" },
      });
      return NextResponse.json(result);
    }

    if (body.accion === "aprobar") {
      verificarPermiso(session.user.rol, "rp:aprobar");
      const result = await aprobarRP(id, session.user.id);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
