import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verificarPermiso } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { terceroSchema } from "@/schemas/tercero.schema";
import { crearTercero, buscarTerceros } from "@/services/terceros.service";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (query) {
    const terceros = await buscarTerceros(query);
    return NextResponse.json(terceros);
  }

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [terceros, total] = await Promise.all([
    prisma.tercero.findMany({
      where: { activo: true },
      orderBy: { nombreCompleto: "asc" },
      skip,
      take: limit,
    }),
    prisma.tercero.count({ where: { activo: true } }),
  ]);

  return NextResponse.json({ data: terceros, total, page, limit });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    verificarPermiso(session.user.rol, "terceros:crear");
    const body = await request.json();
    const data = terceroSchema.parse(body);
    const tercero = await crearTercero(data, session.user.id);
    return NextResponse.json(tercero, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
