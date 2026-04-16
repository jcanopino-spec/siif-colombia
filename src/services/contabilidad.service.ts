import { prisma } from "@/lib/prisma";
import { registrarAudit } from "@/lib/audit";
import { obtenerSiguienteConsecutivo } from "./consecutivo.service";
import { ComprobanteInput } from "@/schemas/contabilidad.schema";
import { TipoConsecutivo, EstadoDocumento } from "@prisma/client";
import Decimal from "decimal.js";

const TIPO_CONSECUTIVO_MAP: Record<string, TipoConsecutivo> = {
  INGRESO: "COMPROBANTE_INGRESO",
  EGRESO: "COMPROBANTE_EGRESO",
  GENERAL: "COMPROBANTE_GENERAL",
};

export async function crearComprobante(
  data: ComprobanteInput,
  usuarioId: string
) {
  // Validar partida doble
  const totalDebitos = data.movimientos.reduce(
    (sum, m) => sum.plus(m.debito),
    new Decimal(0)
  );
  const totalCreditos = data.movimientos.reduce(
    (sum, m) => sum.plus(m.credito),
    new Decimal(0)
  );

  if (!totalDebitos.equals(totalCreditos)) {
    throw new Error(
      `Los débitos ($${totalDebitos.toFixed(2)}) deben ser iguales a los créditos ($${totalCreditos.toFixed(2)})`
    );
  }

  if (totalDebitos.isZero()) {
    throw new Error("El comprobante debe tener movimientos con valor");
  }

  // Validar que cada movimiento tenga débito O crédito, no ambos
  for (const mov of data.movimientos) {
    if (mov.debito > 0 && mov.credito > 0) {
      throw new Error(
        "Cada movimiento debe tener débito o crédito, no ambos"
      );
    }
    if (mov.debito === 0 && mov.credito === 0) {
      throw new Error("Cada movimiento debe tener un valor mayor a cero");
    }
  }

  // Validar cuentas de movimiento
  const cuentaIds = data.movimientos.map((m) => m.cuentaId);
  const cuentas = await prisma.cuentaContable.findMany({
    where: { id: { in: cuentaIds } },
  });

  for (const cuenta of cuentas) {
    if (cuenta.tipo === "TITULO") {
      throw new Error(
        `La cuenta ${cuenta.codigo} - ${cuenta.nombre} es de título y no permite movimientos`
      );
    }
  }

  // Validar cuentas que requieren tercero
  for (const mov of data.movimientos) {
    const cuenta = cuentas.find((c) => c.id === mov.cuentaId);
    if (cuenta?.requiereTercero && !mov.terceroId) {
      throw new Error(
        `La cuenta ${cuenta.codigo} requiere un tercero asociado`
      );
    }
  }

  // Validar vigencia abierta
  const vigencia = await prisma.vigencia.findUnique({
    where: { id: data.vigenciaId },
  });
  if (!vigencia || vigencia.estado !== "ABIERTA") {
    throw new Error("La vigencia no está abierta para operaciones");
  }

  // Obtener consecutivo
  const tipoConsecutivo = TIPO_CONSECUTIVO_MAP[data.tipo];
  const numero = await obtenerSiguienteConsecutivo(
    data.vigenciaId,
    tipoConsecutivo
  );

  // Crear comprobante con movimientos
  const comprobante = await prisma.comprobante.create({
    data: {
      numero,
      tipo: data.tipo,
      fecha: data.fecha,
      concepto: data.concepto,
      estado: "BORRADOR",
      vigenciaId: data.vigenciaId,
      creadoPorId: usuarioId,
      movimientos: {
        create: data.movimientos.map((m) => ({
          cuentaId: m.cuentaId,
          terceroId: m.terceroId || null,
          descripcion: m.descripcion || null,
          debito: m.debito,
          credito: m.credito,
        })),
      },
    },
    include: {
      movimientos: { include: { cuenta: true, tercero: true } },
      creadoPor: { select: { nombre: true } },
    },
  });

  await registrarAudit({
    tabla: "comprobantes",
    registroId: comprobante.id,
    accion: "CREAR",
    datosNuevos: { numero, tipo: data.tipo, concepto: data.concepto },
    usuarioId,
  });

  return comprobante;
}

export async function aprobarComprobante(
  comprobanteId: string,
  aprobadorId: string
) {
  const comprobante = await prisma.comprobante.findUnique({
    where: { id: comprobanteId },
    include: { movimientos: true },
  });

  if (!comprobante) throw new Error("Comprobante no encontrado");
  if (comprobante.estado !== "PENDIENTE_APROBACION") {
    throw new Error("Solo se pueden aprobar comprobantes pendientes");
  }
  if (comprobante.creadoPorId === aprobadorId) {
    throw new Error("El creador del comprobante no puede aprobarlo");
  }

  // Re-validar partida doble
  const totalDebitos = comprobante.movimientos.reduce(
    (sum, m) => sum.plus(m.debito.toString()),
    new Decimal(0)
  );
  const totalCreditos = comprobante.movimientos.reduce(
    (sum, m) => sum.plus(m.credito.toString()),
    new Decimal(0)
  );
  if (!totalDebitos.equals(totalCreditos)) {
    throw new Error("El comprobante no cumple partida doble");
  }

  const actualizado = await prisma.comprobante.update({
    where: { id: comprobanteId },
    data: {
      estado: "APROBADO",
      aprobadoPorId: aprobadorId,
      fechaAprobacion: new Date(),
    },
  });

  await registrarAudit({
    tabla: "comprobantes",
    registroId: comprobanteId,
    accion: "APROBAR",
    datosAnteriores: { estado: "PENDIENTE_APROBACION" },
    datosNuevos: { estado: "APROBADO" },
    usuarioId: aprobadorId,
  });

  return actualizado;
}

export async function anularComprobante(
  comprobanteId: string,
  usuarioId: string
) {
  const comprobante = await prisma.comprobante.findUnique({
    where: { id: comprobanteId },
  });

  if (!comprobante) throw new Error("Comprobante no encontrado");
  if (comprobante.estado === "ANULADO") {
    throw new Error("El comprobante ya está anulado");
  }

  const actualizado = await prisma.comprobante.update({
    where: { id: comprobanteId },
    data: { estado: "ANULADO" },
  });

  await registrarAudit({
    tabla: "comprobantes",
    registroId: comprobanteId,
    accion: "ANULAR",
    datosAnteriores: { estado: comprobante.estado },
    datosNuevos: { estado: "ANULADO" },
    usuarioId,
  });

  return actualizado;
}

export async function enviarAAprobacion(
  comprobanteId: string,
  usuarioId: string
) {
  const comprobante = await prisma.comprobante.findUnique({
    where: { id: comprobanteId },
  });

  if (!comprobante) throw new Error("Comprobante no encontrado");
  if (comprobante.estado !== "BORRADOR") {
    throw new Error("Solo se pueden enviar borradores a aprobación");
  }

  return prisma.comprobante.update({
    where: { id: comprobanteId },
    data: { estado: "PENDIENTE_APROBACION" },
  });
}

export async function obtenerLibroDiario(
  vigenciaId: string,
  fechaDesde: Date,
  fechaHasta: Date
) {
  return prisma.comprobante.findMany({
    where: {
      vigenciaId,
      estado: "APROBADO",
      fecha: { gte: fechaDesde, lte: fechaHasta },
    },
    include: {
      movimientos: {
        include: {
          cuenta: { select: { codigo: true, nombre: true } },
          tercero: { select: { nombreCompleto: true, numeroDocumento: true } },
        },
      },
    },
    orderBy: [{ fecha: "asc" }, { numero: "asc" }],
  });
}

export async function obtenerLibroMayor(
  vigenciaId: string,
  cuentaId: string,
  fechaDesde: Date,
  fechaHasta: Date
) {
  return prisma.movimientoContable.findMany({
    where: {
      cuentaId,
      comprobante: {
        vigenciaId,
        estado: "APROBADO",
        fecha: { gte: fechaDesde, lte: fechaHasta },
      },
    },
    include: {
      comprobante: {
        select: { numero: true, tipo: true, fecha: true, concepto: true },
      },
      tercero: { select: { nombreCompleto: true } },
    },
    orderBy: { comprobante: { fecha: "asc" } },
  });
}
