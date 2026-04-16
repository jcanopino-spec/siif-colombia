import { prisma } from "@/lib/prisma";
import { registrarAudit } from "@/lib/audit";
import { obtenerSiguienteConsecutivo } from "./consecutivo.service";
import { PagoInput } from "@/schemas/tesoreria.schema";
import Decimal from "decimal.js";

export async function crearPago(data: PagoInput, usuarioId: string) {
  // Validar vigencia abierta
  const vigencia = await prisma.vigencia.findUnique({
    where: { id: data.vigenciaId },
  });
  if (!vigencia || vigencia.estado !== "ABIERTA") {
    throw new Error("La vigencia no está abierta");
  }

  // Validar RP aprobado
  const rp = await prisma.rP.findUnique({
    where: { id: data.rpId },
    include: { items: true, pagos: { where: { estado: { not: "ANULADO" } } } },
  });
  if (!rp || rp.estado !== "APROBADO") {
    throw new Error("El RP debe estar aprobado");
  }

  // Calcular saldo del RP
  const totalRP = rp.items.reduce(
    (sum, item) => sum.plus(item.valor.toString()),
    new Decimal(0)
  );
  const pagosAnteriores = rp.pagos.reduce(
    (sum, pago) => sum.plus(pago.valor.toString()),
    new Decimal(0)
  );
  const saldoRP = totalRP.minus(pagosAnteriores);

  if (new Decimal(data.valor).greaterThan(saldoRP)) {
    throw new Error(
      `El pago ($${data.valor.toLocaleString()}) supera el saldo del RP ($${saldoRP.toFixed(2)})`
    );
  }

  // Calcular retenciones
  const totalRetenciones = data.retenciones.reduce(
    (sum, r) => sum.plus(r.valor),
    new Decimal(0)
  );
  const valorNeto = new Decimal(data.valor).minus(totalRetenciones);

  const numero = await obtenerSiguienteConsecutivo(
    data.vigenciaId,
    "ORDEN_PAGO"
  );

  // Crear pago con retenciones en una transacción
  const pago = await prisma.$transaction(async (tx) => {
    const nuevoPago = await tx.pago.create({
      data: {
        numero,
        fecha: data.fecha,
        valor: data.valor,
        valorNeto: valorNeto.toNumber(),
        concepto: data.concepto,
        estado: "BORRADOR",
        medioPago: data.medioPago,
        vigenciaId: data.vigenciaId,
        rpId: data.rpId,
        terceroId: data.terceroId,
        cuentaBancariaId: data.cuentaBancariaId,
        creadoPorId: usuarioId,
        retenciones: {
          create: data.retenciones.map((r) => ({
            terceroId: data.terceroId,
            tipoRetencionId: r.tipoRetencionId,
            base: r.base,
            porcentaje: r.porcentaje,
            valor: r.valor,
          })),
        },
      },
      include: {
        retenciones: { include: { tipoRetencion: true } },
        rp: { select: { numero: true } },
        tercero: { select: { nombreCompleto: true, numeroDocumento: true } },
        cuentaBancaria: { select: { banco: true, numeroCuenta: true } },
      },
    });

    return nuevoPago;
  });

  await registrarAudit({
    tabla: "pagos",
    registroId: pago.id,
    accion: "CREAR",
    datosNuevos: {
      numero,
      valor: data.valor,
      valorNeto: valorNeto.toNumber(),
      retenciones: totalRetenciones.toNumber(),
    },
    usuarioId,
  });

  return pago;
}

export async function aprobarPago(pagoId: string, aprobadorId: string) {
  const pago = await prisma.pago.findUnique({
    where: { id: pagoId },
    include: { retenciones: true, rp: { include: { items: true } } },
  });

  if (!pago) throw new Error("Pago no encontrado");
  if (pago.estado !== "PENDIENTE_APROBACION") {
    throw new Error("Solo se pueden aprobar pagos pendientes");
  }
  if (pago.creadoPorId === aprobadorId) {
    throw new Error("El creador del pago no puede aprobarlo");
  }

  // Crear comprobante contable de egreso automáticamente
  const comprobanteNumero = await obtenerSiguienteConsecutivo(
    pago.vigenciaId,
    "COMPROBANTE_EGRESO"
  );

  const resultado = await prisma.$transaction(async (tx) => {
    // Aprobar el pago
    const pagoAprobado = await tx.pago.update({
      where: { id: pagoId },
      data: {
        estado: "APROBADO",
        aprobadoPorId: aprobadorId,
        fechaAprobacion: new Date(),
      },
    });

    // Generar comprobante contable de egreso
    // Débito: Cuenta de gasto (del rubro del RP)
    // Crédito: Cuenta bancaria
    // Crédito: Cuentas de retención (si aplica)
    const movimientos = [];

    // Débito al gasto (cuenta 2401 - cuentas por pagar)
    movimientos.push({
      cuentaId: await obtenerCuentaPorCodigo(tx, "240101"),
      terceroId: pago.terceroId,
      descripcion: pago.concepto,
      debito: pago.valor,
      credito: new Decimal(0),
    });

    // Crédito a banco (valor neto)
    movimientos.push({
      cuentaId: await obtenerCuentaPorCodigo(tx, "111005"),
      terceroId: null,
      descripcion: `Pago #${pago.numero}`,
      debito: new Decimal(0),
      credito: pago.valorNeto,
    });

    // Créditos a retenciones
    for (const ret of pago.retenciones) {
      if (new Decimal(ret.valor.toString()).greaterThan(0)) {
        // Usar cuenta genérica de retención
        const cuentaRetencion = await obtenerCuentaRetencion(
          tx,
          ret.tipoRetencionId
        );
        movimientos.push({
          cuentaId: cuentaRetencion,
          terceroId: null,
          descripcion: `Retención pago #${pago.numero}`,
          debito: new Decimal(0),
          credito: ret.valor,
        });
      }
    }

    const comprobante = await tx.comprobante.create({
      data: {
        numero: comprobanteNumero,
        tipo: "EGRESO",
        fecha: pago.fecha,
        concepto: `Contabilización pago #${pago.numero} - ${pago.concepto}`,
        estado: "APROBADO",
        vigenciaId: pago.vigenciaId,
        creadoPorId: aprobadorId,
        aprobadoPorId: aprobadorId,
        fechaAprobacion: new Date(),
        pagoId: pago.id,
        movimientos: {
          create: movimientos.map((m) => ({
            cuentaId: m.cuentaId,
            terceroId: m.terceroId,
            descripcion: m.descripcion,
            debito: m.debito,
            credito: m.credito,
          })),
        },
      },
    });

    return { pago: pagoAprobado, comprobante };
  });

  await registrarAudit({
    tabla: "pagos",
    registroId: pagoId,
    accion: "APROBAR",
    datosNuevos: {
      estado: "APROBADO",
      comprobanteGenerado: resultado.comprobante.id,
    },
    usuarioId: aprobadorId,
  });

  return resultado;
}

async function obtenerCuentaPorCodigo(
  tx: any,
  codigo: string
): Promise<string> {
  const cuenta = await tx.cuentaContable.findUnique({ where: { codigo } });
  if (!cuenta) throw new Error(`Cuenta contable ${codigo} no encontrada`);
  return cuenta.id;
}

async function obtenerCuentaRetencion(
  tx: any,
  tipoRetencionId: string
): Promise<string> {
  const tipo = await tx.tipoRetencion.findUnique({
    where: { id: tipoRetencionId },
  });
  if (tipo?.cuentaContableId) return tipo.cuentaContableId;

  // Fallback a cuenta genérica de retención según tipo de impuesto
  const cuentaDefault = await tx.cuentaContable.findFirst({
    where: { codigo: "243609" }, // Retención fuente - servicios (genérica)
  });
  return cuentaDefault?.id || "";
}

export async function calcularRetenciones(
  terceroId: string,
  valorBase: number,
  vigenciaAnio: number
) {
  const tercero = await prisma.tercero.findUnique({
    where: { id: terceroId },
  });
  if (!tercero) throw new Error("Tercero no encontrado");

  const parametros = await prisma.parametroTributario.findUnique({
    where: { anio: vigenciaAnio },
  });
  const uvt = parametros ? Number(parametros.valorUvt) : 47065;

  const tiposRetencion = await prisma.tipoRetencion.findMany({
    where: { activo: true },
  });

  const retenciones = [];

  for (const tipo of tiposRetencion) {
    const baseMinimaPesos = tipo.baseMinimaEnUvt
      ? new Decimal(tipo.baseMinima.toString()).times(uvt).toNumber()
      : Number(tipo.baseMinima);

    if (valorBase >= baseMinimaPesos && Number(tipo.porcentaje) > 0) {
      const valorRetencion = new Decimal(valorBase)
        .times(tipo.porcentaje.toString())
        .toDecimalPlaces(0)
        .toNumber();

      if (valorRetencion > 0) {
        retenciones.push({
          tipoRetencionId: tipo.id,
          codigo: tipo.codigo,
          nombre: tipo.nombre,
          base: valorBase,
          porcentaje: Number(tipo.porcentaje),
          valor: valorRetencion,
          sugerido: true,
        });
      }
    }
  }

  return retenciones;
}
