import { AccionAudit, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

interface AuditParams {
  tabla: string;
  registroId: string;
  accion: AccionAudit;
  datosAnteriores?: Record<string, unknown> | null;
  datosNuevos?: Record<string, unknown> | null;
  usuarioId: string;
  ipAddress?: string;
}

export async function registrarAudit(params: AuditParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      tabla: params.tabla,
      registroId: params.registroId,
      accion: params.accion,
      datosAnteriores: (params.datosAnteriores as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      datosNuevos: (params.datosNuevos as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      usuarioId: params.usuarioId,
      ipAddress: params.ipAddress,
    },
  });
}
