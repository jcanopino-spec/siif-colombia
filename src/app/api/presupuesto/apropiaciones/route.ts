import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verificarPermiso } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { apropiacionSchema } from "@/schemas/presupuesto.schema";
import { registrarAudit } from "@/lib/audit";
import { obtenerSaldoApropiacion } from "@/services/presupuesto.service";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vigenciaId = searchParams.get("vigenciaId");

  if (!vigenciaId) {
    return NextResponse.json({ error: "vigenciaId requerido" }, { status: 400 });
  }

  const apropiaciones = await prisma.apropiacion.findMany({
    where: { vigenciaId },
    include: { rubro: true },
    orderBy: { rubro: { codigo: "asc" } },
  });

  // Enriquecer con saldos calculados
  const resultado = await Promise.all(
    apropiaciones.map(async (a) => {
      const saldo = await obtenerSaldoApropiacion(vigenciaId, a.rubroId);
      return { ...a, ...saldo };
    })
  );

  return NextResponse.json(resultado);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    verificarPermiso(session.user.rol, "cdp:crear"); // Solo admin y auxiliares cargan apropiaciones
    const body = await request.json();
    const data = apropiacionSchema.parse(body);

    const apropiacion = await prisma.apropiacion.upsert({
      where: {
        vigenciaId_rubroId: {
          vigenciaId: data.vigenciaId,
          rubroId: data.rubroId,
        },
      },
      update: { apropiacionInicial: data.apropiacionInicial },
      create: {
        vigenciaId: data.vigenciaId,
        rubroId: data.rubroId,
        apropiacionInicial: data.apropiacionInicial,
      },
      include: { rubro: true },
    });

    await registrarAudit({
      tabla: "apropiaciones",
      registroId: apropiacion.id,
      accion: "CREAR",
      datosNuevos: {
        rubro: apropiacion.rubro.codigo,
        apropiacionInicial: data.apropiacionInicial,
      },
      usuarioId: session.user.id,
    });

    return NextResponse.json(apropiacion, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
