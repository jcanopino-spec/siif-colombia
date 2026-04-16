import { TipoConsecutivo } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function obtenerSiguienteConsecutivo(
  vigenciaId: string,
  tipo: TipoConsecutivo
): Promise<number> {
  const resultado = await prisma.consecutivo.update({
    where: { vigenciaId_tipo: { vigenciaId, tipo } },
    data: { siguiente: { increment: 1 } },
  });

  return resultado.siguiente - 1;
}
