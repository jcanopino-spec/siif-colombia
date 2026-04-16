import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verificarPermiso } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import {
  aprobarComprobante,
  anularComprobante,
  enviarAAprobacion,
} from "@/services/contabilidad.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const comprobante = await prisma.comprobante.findUnique({
    where: { id },
    include: {
      movimientos: {
        include: {
          cuenta: { select: { id: true, codigo: true, nombre: true } },
          tercero: { select: { id: true, nombreCompleto: true, numeroDocumento: true } },
        },
      },
      creadoPor: { select: { nombre: true } },
      aprobadoPor: { select: { nombre: true } },
    },
  });

  if (!comprobante) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(comprobante);
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
      verificarPermiso(session.user.rol, "comprobante:editar");
      const result = await enviarAAprobacion(id, session.user.id);
      return NextResponse.json(result);
    }

    if (body.accion === "aprobar") {
      verificarPermiso(session.user.rol, "comprobante:aprobar");
      const result = await aprobarComprobante(id, session.user.id);
      return NextResponse.json(result);
    }

    if (body.accion === "anular") {
      verificarPermiso(session.user.rol, "comprobante:anular");
      const result = await anularComprobante(id, session.user.id);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
