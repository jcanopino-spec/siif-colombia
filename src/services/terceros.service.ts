import { prisma } from "@/lib/prisma";
import { registrarAudit } from "@/lib/audit";
import { TerceroInput } from "@/schemas/tercero.schema";

function construirNombreCompleto(data: TerceroInput): string {
  if (data.tipoPersona === "JURIDICA") {
    return data.razonSocial || "";
  }
  return [
    data.primerNombre,
    data.segundoNombre,
    data.primerApellido,
    data.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ");
}

export async function crearTercero(data: TerceroInput, usuarioId: string) {
  const nombreCompleto = construirNombreCompleto(data);

  const tercero = await prisma.tercero.create({
    data: {
      ...data,
      nombreCompleto,
    },
  });

  await registrarAudit({
    tabla: "terceros",
    registroId: tercero.id,
    accion: "CREAR",
    datosNuevos: {
      numeroDocumento: data.numeroDocumento,
      nombreCompleto,
    },
    usuarioId,
  });

  return tercero;
}

export async function actualizarTercero(
  id: string,
  data: Partial<TerceroInput>,
  usuarioId: string
) {
  const anterior = await prisma.tercero.findUnique({ where: { id } });
  if (!anterior) throw new Error("Tercero no encontrado");

  const nombreCompleto =
    data.tipoPersona || data.primerNombre || data.razonSocial
      ? construirNombreCompleto({ ...anterior, ...data } as TerceroInput)
      : anterior.nombreCompleto;

  const actualizado = await prisma.tercero.update({
    where: { id },
    data: {
      ...data,
      nombreCompleto,
    },
  });

  await registrarAudit({
    tabla: "terceros",
    registroId: id,
    accion: "ACTUALIZAR",
    datosAnteriores: { nombreCompleto: anterior.nombreCompleto },
    datosNuevos: { nombreCompleto: actualizado.nombreCompleto },
    usuarioId,
  });

  return actualizado;
}

export async function buscarTerceros(query: string) {
  return prisma.tercero.findMany({
    where: {
      OR: [
        { nombreCompleto: { contains: query, mode: "insensitive" } },
        { numeroDocumento: { contains: query } },
        { razonSocial: { contains: query, mode: "insensitive" } },
      ],
      activo: true,
    },
    take: 20,
    orderBy: { nombreCompleto: "asc" },
  });
}
