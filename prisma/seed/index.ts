import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { planCuentasCGN } from "./plan-cuentas-cgn";
import { tiposRetencion } from "./tipos-retencion";
import { rubrosPresupuestales } from "./rubros-presupuestales";

const prisma = new PrismaClient();

async function main() {
  console.log("🏛️  Iniciando seed de SIIF Colombia...\n");

  // 1. Crear entidad base
  console.log("📋 Creando entidad base...");
  const entidad = await prisma.entidad.upsert({
    where: { nit: "899999999" },
    update: {},
    create: {
      nit: "899999999",
      nombre: "Entidad Pública de Ejemplo",
      codigoDane: "11001",
      nivel: "MUNICIPAL",
    },
  });

  // 2. Crear vigencia fiscal activa
  console.log("📅 Creando vigencia fiscal 2026...");
  const vigencia = await prisma.vigencia.upsert({
    where: { entidadId_anio: { entidadId: entidad.id, anio: 2026 } },
    update: {},
    create: {
      anio: 2026,
      estado: "ABIERTA",
      fechaApertura: new Date("2026-01-01"),
      entidadId: entidad.id,
    },
  });

  // 3. Crear usuario administrador
  console.log("👤 Creando usuario administrador...");
  const passwordHash = await hash("admin123", 12);
  await prisma.usuario.upsert({
    where: { email: "admin@siif.gov.co" },
    update: {},
    create: {
      email: "admin@siif.gov.co",
      nombre: "Administrador del Sistema",
      passwordHash,
      rol: "ADMINISTRADOR",
      entidadId: entidad.id,
    },
  });

  // Crear usuario jefe de área
  await prisma.usuario.upsert({
    where: { email: "jefe@siif.gov.co" },
    update: {},
    create: {
      email: "jefe@siif.gov.co",
      nombre: "Jefe de Presupuesto",
      passwordHash: await hash("jefe123", 12),
      rol: "JEFE_AREA",
      entidadId: entidad.id,
    },
  });

  // Crear usuario auxiliar
  await prisma.usuario.upsert({
    where: { email: "auxiliar@siif.gov.co" },
    update: {},
    create: {
      email: "auxiliar@siif.gov.co",
      nombre: "Auxiliar Contable",
      passwordHash: await hash("auxiliar123", 12),
      rol: "AUXILIAR",
      entidadId: entidad.id,
    },
  });

  // 4. Cargar Plan de Cuentas CGN
  console.log("📊 Cargando Plan de Cuentas CGN...");
  for (const cuenta of planCuentasCGN) {
    await prisma.cuentaContable.upsert({
      where: { codigo: cuenta.codigo },
      update: {},
      create: {
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        nivel: cuenta.nivel,
        naturaleza: cuenta.naturaleza,
        tipo: cuenta.tipo,
        codigoPadre: cuenta.codigoPadre,
        requiereTercero: cuenta.requiereTercero ?? false,
      },
    });
  }
  console.log(`   ✓ ${planCuentasCGN.length} cuentas contables cargadas`);

  // 5. Cargar Rubros Presupuestales
  console.log("💰 Cargando rubros presupuestales...");
  for (const rubro of rubrosPresupuestales) {
    await prisma.rubroPresupuestal.upsert({
      where: { codigo: rubro.codigo },
      update: {},
      create: {
        codigo: rubro.codigo,
        nombre: rubro.nombre,
        tipo: rubro.tipo,
        nivel: rubro.nivel,
        codigoPadre: rubro.codigoPadre,
        esTitulo: rubro.esTitulo,
      },
    });
  }
  console.log(`   ✓ ${rubrosPresupuestales.length} rubros presupuestales cargados`);

  // 6. Cargar Tipos de Retención
  console.log("🧾 Cargando tipos de retención...");
  for (const retencion of tiposRetencion) {
    await prisma.tipoRetencion.upsert({
      where: { codigo: retencion.codigo },
      update: {},
      create: {
        codigo: retencion.codigo,
        nombre: retencion.nombre,
        impuesto: retencion.impuesto,
        porcentaje: retencion.porcentaje,
        baseMinima: retencion.baseMinima,
        baseMinimaEnUvt: retencion.baseMinimaEnUvt,
      },
    });
  }
  console.log(`   ✓ ${tiposRetencion.length} tipos de retención cargados`);

  // 7. Cargar Parámetros Tributarios
  console.log("📐 Cargando parámetros tributarios...");
  const parametros = [
    { anio: 2024, valorUvt: 47065, salarioMinimo: 1300000 },
    { anio: 2025, valorUvt: 49799, salarioMinimo: 1423500 },
    { anio: 2026, valorUvt: 52631, salarioMinimo: 1500000 },
  ];
  for (const param of parametros) {
    await prisma.parametroTributario.upsert({
      where: { anio: param.anio },
      update: { valorUvt: param.valorUvt, salarioMinimo: param.salarioMinimo },
      create: param,
    });
  }
  console.log(`   ✓ ${parametros.length} parámetros tributarios cargados`);

  // 8. Crear consecutivos para la vigencia
  console.log("🔢 Creando consecutivos...");
  const tiposConsecutivo = [
    "COMPROBANTE_INGRESO",
    "COMPROBANTE_EGRESO",
    "COMPROBANTE_GENERAL",
    "CDP",
    "RP",
    "ORDEN_PAGO",
    "RECAUDO",
  ] as const;

  for (const tipo of tiposConsecutivo) {
    await prisma.consecutivo.upsert({
      where: { vigenciaId_tipo: { vigenciaId: vigencia.id, tipo } },
      update: {},
      create: {
        vigenciaId: vigencia.id,
        tipo,
        siguiente: 1,
      },
    });
  }
  console.log(`   ✓ ${tiposConsecutivo.length} consecutivos creados`);

  // 9. Cargar reglas normativas por defecto
  console.log("⚖️  Cargando reglas normativas...");
  const reglas = [
    {
      modulo: "contabilidad",
      nombre: "Partida doble obligatoria",
      descripcion: "Los débitos deben ser iguales a los créditos en cada comprobante",
      condicion: { campo: "diferencia_debito_credito", operador: "eq", valor: 0 },
      accion: { tipo: "BLOQUEAR", mensaje: "Los débitos no son iguales a los créditos" },
      normativa: "CGN - Marco normativo entidades de gobierno",
    },
    {
      modulo: "presupuesto",
      nombre: "CDP no puede superar apropiación",
      descripcion: "El valor del CDP no puede ser mayor al saldo disponible de apropiación",
      condicion: { campo: "valor_cdp_vs_saldo", operador: "lte", valor: "saldo_disponible" },
      accion: { tipo: "BLOQUEAR", mensaje: "El CDP supera el saldo disponible de apropiación" },
      normativa: "Decreto 111/1996 - Estatuto Orgánico de Presupuesto",
    },
    {
      modulo: "presupuesto",
      nombre: "RP no puede superar saldo del CDP",
      descripcion: "El valor del RP no puede exceder el saldo disponible del CDP",
      condicion: { campo: "valor_rp_vs_saldo_cdp", operador: "lte", valor: "saldo_cdp" },
      accion: { tipo: "BLOQUEAR", mensaje: "El RP supera el saldo disponible del CDP" },
      normativa: "Decreto 111/1996 Art. 71",
    },
    {
      modulo: "tesoreria",
      nombre: "Pago no puede superar saldo del RP",
      descripcion: "El pago no puede exceder el saldo pendiente del registro presupuestal",
      condicion: { campo: "valor_pago_vs_saldo_rp", operador: "lte", valor: "saldo_rp" },
      accion: { tipo: "BLOQUEAR", mensaje: "El pago supera el saldo disponible del RP" },
      normativa: "Decreto 111/1996",
    },
    {
      modulo: "presupuesto",
      nombre: "Alerta ejecución alta",
      descripcion: "Advierte cuando un rubro supera el 90% de ejecución",
      condicion: { campo: "porcentaje_ejecucion", operador: "gt", valor: 90 },
      accion: { tipo: "ADVERTIR", mensaje: "Este rubro tiene una ejecución superior al 90%" },
      normativa: "Buenas prácticas de gestión presupuestal",
    },
  ];

  for (const regla of reglas) {
    const existing = await prisma.reglaNormativa.findFirst({
      where: { modulo: regla.modulo, nombre: regla.nombre },
    });
    if (!existing) {
      await prisma.reglaNormativa.create({ data: regla });
    }
  }
  console.log(`   ✓ ${reglas.length} reglas normativas cargadas`);

  console.log("\n✅ Seed completado exitosamente!");
  console.log("\n📌 Usuarios creados:");
  console.log("   admin@siif.gov.co / admin123 (Administrador)");
  console.log("   jefe@siif.gov.co / jefe123 (Jefe de Área)");
  console.log("   auxiliar@siif.gov.co / auxiliar123 (Auxiliar)");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
