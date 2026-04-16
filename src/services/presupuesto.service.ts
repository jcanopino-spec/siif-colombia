import { prisma } from "@/lib/prisma";
import { registrarAudit } from "@/lib/audit";
import { obtenerSiguienteConsecutivo } from "./consecutivo.service";
import { CDPInput, RPInput } from "@/schemas/presupuesto.schema";
import Decimal from "decimal.js";

// ============================================================
// APROPIACIONES
// ============================================================

export async function obtenerSaldoApropiacion(
  vigenciaId: string,
  rubroId: string
) {
  const apropiacion = await prisma.apropiacion.findUnique({
    where: { vigenciaId_rubroId: { vigenciaId, rubroId } },
  });

  if (!apropiacion) return { apropiacionDefinitiva: 0, cdpsExpedidos: 0, saldo: 0 };

  const definitiva = new Decimal(apropiacion.apropiacionInicial.toString())
    .plus(apropiacion.adiciones.toString())
    .minus(apropiacion.reducciones.toString())
    .plus(apropiacion.creditosContraparte.toString())
    .minus(apropiacion.contrareditosContraparte.toString());

  // Calcular CDPs expedidos (aprobados y no anulados)
  const cdpsAgregados = await prisma.itemCDP.aggregate({
    _sum: { valor: true },
    where: {
      rubroId,
      cdp: {
        vigenciaId,
        estado: { in: ["APROBADO", "PENDIENTE_APROBACION", "BORRADOR"] },
      },
    },
  });

  const cdpsExpedidos = new Decimal(
    cdpsAgregados._sum.valor?.toString() || "0"
  );
  const saldo = definitiva.minus(cdpsExpedidos);

  return {
    apropiacionDefinitiva: definitiva.toNumber(),
    cdpsExpedidos: cdpsExpedidos.toNumber(),
    saldo: saldo.toNumber(),
  };
}

// ============================================================
// CDP
// ============================================================

export async function crearCDP(data: CDPInput, usuarioId: string) {
  // Validar vigencia abierta
  const vigencia = await prisma.vigencia.findUnique({
    where: { id: data.vigenciaId },
  });
  if (!vigencia || vigencia.estado !== "ABIERTA") {
    throw new Error("La vigencia no está abierta");
  }

  // Validar saldo de apropiación por cada rubro
  for (const item of data.items) {
    const saldo = await obtenerSaldoApropiacion(data.vigenciaId, item.rubroId);
    if (item.valor > saldo.saldo) {
      const rubro = await prisma.rubroPresupuestal.findUnique({
        where: { id: item.rubroId },
      });
      throw new Error(
        `El valor $${item.valor.toLocaleString()} supera el saldo disponible $${saldo.saldo.toLocaleString()} del rubro ${rubro?.codigo || item.rubroId}`
      );
    }
  }

  const numero = await obtenerSiguienteConsecutivo(data.vigenciaId, "CDP");

  const cdp = await prisma.cDP.create({
    data: {
      numero,
      fecha: data.fecha,
      objeto: data.objeto,
      estado: "BORRADOR",
      vigenciaId: data.vigenciaId,
      solicitante: data.solicitante,
      dependencia: data.dependencia,
      creadoPorId: usuarioId,
      items: {
        create: data.items.map((item) => ({
          rubroId: item.rubroId,
          valor: item.valor,
        })),
      },
    },
    include: {
      items: { include: { rubro: true } },
      creadoPor: { select: { nombre: true } },
    },
  });

  await registrarAudit({
    tabla: "cdps",
    registroId: cdp.id,
    accion: "CREAR",
    datosNuevos: { numero, objeto: data.objeto },
    usuarioId,
  });

  return cdp;
}

export async function aprobarCDP(cdpId: string, aprobadorId: string) {
  const cdp = await prisma.cDP.findUnique({
    where: { id: cdpId },
    include: { items: true },
  });

  if (!cdp) throw new Error("CDP no encontrado");
  if (cdp.estado !== "PENDIENTE_APROBACION") {
    throw new Error("Solo se pueden aprobar CDPs pendientes");
  }
  if (cdp.creadoPorId === aprobadorId) {
    throw new Error("El creador del CDP no puede aprobarlo");
  }

  // Re-validar saldos
  for (const item of cdp.items) {
    const saldo = await obtenerSaldoApropiacion(cdp.vigenciaId, item.rubroId);
    if (new Decimal(item.valor.toString()).greaterThan(saldo.saldo)) {
      throw new Error(
        `Saldo insuficiente para aprobar el CDP en uno o más rubros`
      );
    }
  }

  const actualizado = await prisma.cDP.update({
    where: { id: cdpId },
    data: {
      estado: "APROBADO",
      aprobadoPorId: aprobadorId,
      fechaAprobacion: new Date(),
    },
  });

  await registrarAudit({
    tabla: "cdps",
    registroId: cdpId,
    accion: "APROBAR",
    usuarioId: aprobadorId,
  });

  return actualizado;
}

export async function anularCDP(cdpId: string, usuarioId: string) {
  const cdp = await prisma.cDP.findUnique({
    where: { id: cdpId },
    include: { registrosPresupuestales: { where: { estado: { not: "ANULADO" } } } },
  });

  if (!cdp) throw new Error("CDP no encontrado");
  if (cdp.estado === "ANULADO") throw new Error("El CDP ya está anulado");
  if (cdp.registrosPresupuestales.length > 0) {
    throw new Error(
      "No se puede anular un CDP que tiene registros presupuestales vigentes"
    );
  }

  const actualizado = await prisma.cDP.update({
    where: { id: cdpId },
    data: { estado: "ANULADO" },
  });

  await registrarAudit({
    tabla: "cdps",
    registroId: cdpId,
    accion: "ANULAR",
    usuarioId,
  });

  return actualizado;
}

// ============================================================
// RP (Registro Presupuestal)
// ============================================================

export async function obtenerSaldoCDP(cdpId: string) {
  const cdp = await prisma.cDP.findUnique({
    where: { id: cdpId },
    include: { items: true },
  });

  if (!cdp) throw new Error("CDP no encontrado");

  // Total del CDP por rubro
  const totalesCDP: Record<string, Decimal> = {};
  for (const item of cdp.items) {
    totalesCDP[item.rubroId] = new Decimal(item.valor.toString());
  }

  // Total ya comprometido en RPs vigentes
  const rpsVigentes = await prisma.itemRP.findMany({
    where: {
      rp: { cdpId, estado: { not: "ANULADO" } },
    },
  });

  for (const itemRp of rpsVigentes) {
    if (totalesCDP[itemRp.rubroId]) {
      totalesCDP[itemRp.rubroId] = totalesCDP[itemRp.rubroId].minus(
        itemRp.valor.toString()
      );
    }
  }

  return totalesCDP;
}

export async function crearRP(data: RPInput, usuarioId: string) {
  const vigencia = await prisma.vigencia.findUnique({
    where: { id: data.vigenciaId },
  });
  if (!vigencia || vigencia.estado !== "ABIERTA") {
    throw new Error("La vigencia no está abierta");
  }

  const cdp = await prisma.cDP.findUnique({ where: { id: data.cdpId } });
  if (!cdp || cdp.estado !== "APROBADO") {
    throw new Error("El CDP debe estar aprobado");
  }

  // Validar saldos del CDP
  const saldosCDP = await obtenerSaldoCDP(data.cdpId);
  for (const item of data.items) {
    const saldo = saldosCDP[item.rubroId];
    if (!saldo || new Decimal(item.valor).greaterThan(saldo)) {
      throw new Error(
        `El valor del RP supera el saldo disponible del CDP para el rubro ${item.rubroId}`
      );
    }
  }

  const numero = await obtenerSiguienteConsecutivo(data.vigenciaId, "RP");

  const rp = await prisma.rP.create({
    data: {
      numero,
      fecha: data.fecha,
      objeto: data.objeto,
      estado: "BORRADOR",
      vigenciaId: data.vigenciaId,
      cdpId: data.cdpId,
      terceroId: data.terceroId,
      tipoCompromiso: data.tipoCompromiso,
      numeroContrato: data.numeroContrato,
      creadoPorId: usuarioId,
      items: {
        create: data.items.map((item) => ({
          rubroId: item.rubroId,
          valor: item.valor,
        })),
      },
    },
    include: {
      items: { include: { rubro: true } },
      cdp: { select: { numero: true } },
      tercero: { select: { nombreCompleto: true, numeroDocumento: true } },
      creadoPor: { select: { nombre: true } },
    },
  });

  await registrarAudit({
    tabla: "registros_presupuestales",
    registroId: rp.id,
    accion: "CREAR",
    datosNuevos: { numero, objeto: data.objeto, cdpNumero: cdp.numero },
    usuarioId,
  });

  return rp;
}

export async function aprobarRP(rpId: string, aprobadorId: string) {
  const rp = await prisma.rP.findUnique({
    where: { id: rpId },
    include: { items: true },
  });

  if (!rp) throw new Error("RP no encontrado");
  if (rp.estado !== "PENDIENTE_APROBACION") {
    throw new Error("Solo se pueden aprobar RPs pendientes");
  }
  if (rp.creadoPorId === aprobadorId) {
    throw new Error("El creador del RP no puede aprobarlo");
  }

  const actualizado = await prisma.rP.update({
    where: { id: rpId },
    data: {
      estado: "APROBADO",
      aprobadoPorId: aprobadorId,
      fechaAprobacion: new Date(),
    },
  });

  await registrarAudit({
    tabla: "registros_presupuestales",
    registroId: rpId,
    accion: "APROBAR",
    usuarioId: aprobadorId,
  });

  return actualizado;
}

// ============================================================
// EJECUCIÓN PRESUPUESTAL
// ============================================================

export async function obtenerEjecucionGastos(vigenciaId: string) {
  const apropiaciones = await prisma.apropiacion.findMany({
    where: { vigenciaId },
    include: { rubro: true },
  });

  const resultado = [];

  for (const aprop of apropiaciones) {
    if (aprop.rubro.tipo !== "GASTO") continue;

    const definitiva = new Decimal(aprop.apropiacionInicial.toString())
      .plus(aprop.adiciones.toString())
      .minus(aprop.reducciones.toString())
      .plus(aprop.creditosContraparte.toString())
      .minus(aprop.contrareditosContraparte.toString());

    // CDPs aprobados
    const cdps = await prisma.itemCDP.aggregate({
      _sum: { valor: true },
      where: {
        rubroId: aprop.rubroId,
        cdp: { vigenciaId, estado: "APROBADO" },
      },
    });

    // RPs aprobados
    const rps = await prisma.itemRP.aggregate({
      _sum: { valor: true },
      where: {
        rubroId: aprop.rubroId,
        rp: { vigenciaId, estado: "APROBADO" },
      },
    });

    // Pagos aprobados — sumatoria de pagos vinculados a RPs de este rubro
    const pagos = await prisma.pago.aggregate({
      _sum: { valor: true },
      where: {
        vigenciaId,
        estado: "APROBADO",
        rp: {
          items: { some: { rubroId: aprop.rubroId } },
        },
      },
    });

    const cdpTotal = new Decimal(cdps._sum.valor?.toString() || "0");
    const rpTotal = new Decimal(rps._sum.valor?.toString() || "0");
    const pagoTotal = new Decimal(pagos._sum.valor?.toString() || "0");

    resultado.push({
      rubroCodigo: aprop.rubro.codigo,
      rubroNombre: aprop.rubro.nombre,
      apropiacionInicial: Number(aprop.apropiacionInicial),
      adiciones: Number(aprop.adiciones),
      reducciones: Number(aprop.reducciones),
      apropiacionDefinitiva: definitiva.toNumber(),
      cdp: cdpTotal.toNumber(),
      compromisos: rpTotal.toNumber(),
      pagos: pagoTotal.toNumber(),
      saldoPorComprometer: definitiva.minus(cdpTotal).toNumber(),
      saldoPorPagar: rpTotal.minus(pagoTotal).toNumber(),
      porcentajeEjecucion: definitiva.isZero()
        ? 0
        : rpTotal.div(definitiva).times(100).toDecimalPlaces(2).toNumber(),
    });
  }

  return resultado.sort((a, b) => a.rubroCodigo.localeCompare(b.rubroCodigo));
}
