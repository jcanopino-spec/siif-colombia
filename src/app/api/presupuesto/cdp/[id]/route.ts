import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verificarPermiso } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { aprobarCDP, anularCDP } from "@/services/presupuesto.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const cdp = await prisma.cDP.findUnique({
    where: { id },
    include: {
      items: { include: { rubro: true } },
      creadoPor: { select: { nombre: true } },
      aprobadoPor: { select: { nombre: true } },
      registrosPresupuestales: {
        select: { id: true, numero: true, estado: true },
      },
    },
  });

  if (!cdp) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(cdp);
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
      const cdp = await prisma.cDP.findUnique({ where: { id } });
      if (!cdp || cdp.estado !== "BORRADOR") {
        return NextResponse.json({ error: "Solo borradores se pueden enviar" }, { status: 400 });
      }
      const result = await prisma.cDP.update({
        where: { id },
        data: { estado: "PENDIENTE_APROBACION" },
      });
      return NextResponse.json(result);
    }

    if (body.accion === "aprobar") {
      verificarPermiso(session.user.rol, "cdp:aprobar");
      const result = await aprobarCDP(id, session.user.id);
      return NextResponse.json(result);
    }

    if (body.accion === "anular") {
      verificarPermiso(session.user.rol, "cdp:anular");
      const result = await anularCDP(id, session.user.id);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
