import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { obtenerEjecucionGastos } from "@/services/presupuesto.service";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vigenciaId = searchParams.get("vigenciaId");

  if (!vigenciaId) {
    return NextResponse.json({ error: "vigenciaId es requerido" }, { status: 400 });
  }

  const ejecucion = await obtenerEjecucionGastos(vigenciaId);
  return NextResponse.json(ejecucion);
}
