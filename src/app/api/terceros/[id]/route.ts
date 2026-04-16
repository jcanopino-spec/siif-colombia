import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verificarPermiso } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { terceroSchema } from "@/schemas/tercero.schema";
import { actualizarTercero } from "@/services/terceros.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const tercero = await prisma.tercero.findUnique({ where: { id } });
  if (!tercero) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json(tercero);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    verificarPermiso(session.user.rol, "terceros:editar");
    const { id } = await params;
    const body = await request.json();
    const data = terceroSchema.partial().parse(body);
    const tercero = await actualizarTercero(id, data, session.user.id);
    return NextResponse.json(tercero);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
