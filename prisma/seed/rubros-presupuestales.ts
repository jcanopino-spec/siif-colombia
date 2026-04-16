// Catálogo de Clasificación Presupuestal (CCP)
// Basado en el Decreto 412 de 2018 y clasificaciones del Ministerio de Hacienda

import { TipoRubro } from "@prisma/client";

interface RubroSeed {
  codigo: string;
  nombre: string;
  tipo: TipoRubro;
  nivel: number;
  codigoPadre: string | null;
  esTitulo: boolean;
}

export const rubrosPresupuestales: RubroSeed[] = [
  // ============================================
  // INGRESOS
  // ============================================
  { codigo: "I", nombre: "INGRESOS", tipo: "INGRESO", nivel: 1, codigoPadre: null, esTitulo: true },
  { codigo: "I-1", nombre: "INGRESOS CORRIENTES", tipo: "INGRESO", nivel: 2, codigoPadre: "I", esTitulo: true },
  { codigo: "I-1-1", nombre: "TRIBUTARIOS", tipo: "INGRESO", nivel: 3, codigoPadre: "I-1", esTitulo: true },
  { codigo: "I-1-1-01", nombre: "Impuesto predial unificado", tipo: "INGRESO", nivel: 4, codigoPadre: "I-1-1", esTitulo: false },
  { codigo: "I-1-1-02", nombre: "Impuesto de industria y comercio", tipo: "INGRESO", nivel: 4, codigoPadre: "I-1-1", esTitulo: false },
  { codigo: "I-1-1-03", nombre: "Sobretasa a la gasolina", tipo: "INGRESO", nivel: 4, codigoPadre: "I-1-1", esTitulo: false },
  { codigo: "I-1-1-04", nombre: "Impuesto de delineación urbana", tipo: "INGRESO", nivel: 4, codigoPadre: "I-1-1", esTitulo: false },
  { codigo: "I-1-1-05", nombre: "Estampillas", tipo: "INGRESO", nivel: 4, codigoPadre: "I-1-1", esTitulo: false },
  { codigo: "I-1-1-90", nombre: "Otros ingresos tributarios", tipo: "INGRESO", nivel: 4, codigoPadre: "I-1-1", esTitulo: false },
  { codigo: "I-1-2", nombre: "NO TRIBUTARIOS", tipo: "INGRESO", nivel: 3, codigoPadre: "I-1", esTitulo: true },
  { codigo: "I-1-2-01", nombre: "Tasas y derechos", tipo: "INGRESO", nivel: 4, codigoPadre: "I-1-2", esTitulo: false },
  { codigo: "I-1-2-02", nombre: "Multas y sanciones", tipo: "INGRESO", nivel: 4, codigoPadre: "I-1-2", esTitulo: false },
  { codigo: "I-1-2-03", nombre: "Contribuciones", tipo: "INGRESO", nivel: 4, codigoPadre: "I-1-2", esTitulo: false },
  { codigo: "I-1-2-04", nombre: "Venta de bienes y servicios", tipo: "INGRESO", nivel: 4, codigoPadre: "I-1-2", esTitulo: false },
  { codigo: "I-1-2-90", nombre: "Otros ingresos no tributarios", tipo: "INGRESO", nivel: 4, codigoPadre: "I-1-2", esTitulo: false },
  { codigo: "I-2", nombre: "TRANSFERENCIAS", tipo: "INGRESO", nivel: 2, codigoPadre: "I", esTitulo: true },
  { codigo: "I-2-1", nombre: "DEL NIVEL NACIONAL", tipo: "INGRESO", nivel: 3, codigoPadre: "I-2", esTitulo: true },
  { codigo: "I-2-1-01", nombre: "Sistema general de participaciones - SGP", tipo: "INGRESO", nivel: 4, codigoPadre: "I-2-1", esTitulo: false },
  { codigo: "I-2-1-02", nombre: "Sistema general de regalías - SGR", tipo: "INGRESO", nivel: 4, codigoPadre: "I-2-1", esTitulo: false },
  { codigo: "I-2-1-03", nombre: "Cofinanciación nacional", tipo: "INGRESO", nivel: 4, codigoPadre: "I-2-1", esTitulo: false },
  { codigo: "I-2-2", nombre: "DEL NIVEL DEPARTAMENTAL", tipo: "INGRESO", nivel: 3, codigoPadre: "I-2", esTitulo: true },
  { codigo: "I-2-2-01", nombre: "Transferencias departamentales", tipo: "INGRESO", nivel: 4, codigoPadre: "I-2-2", esTitulo: false },
  { codigo: "I-3", nombre: "RECURSOS DE CAPITAL", tipo: "INGRESO", nivel: 2, codigoPadre: "I", esTitulo: true },
  { codigo: "I-3-1", nombre: "RECURSOS DEL CRÉDITO", tipo: "INGRESO", nivel: 3, codigoPadre: "I-3", esTitulo: true },
  { codigo: "I-3-1-01", nombre: "Crédito interno", tipo: "INGRESO", nivel: 4, codigoPadre: "I-3-1", esTitulo: false },
  { codigo: "I-3-2", nombre: "OTROS RECURSOS DE CAPITAL", tipo: "INGRESO", nivel: 3, codigoPadre: "I-3", esTitulo: true },
  { codigo: "I-3-2-01", nombre: "Rendimientos financieros", tipo: "INGRESO", nivel: 4, codigoPadre: "I-3-2", esTitulo: false },
  { codigo: "I-3-2-02", nombre: "Superávit fiscal", tipo: "INGRESO", nivel: 4, codigoPadre: "I-3-2", esTitulo: false },
  { codigo: "I-3-2-03", nombre: "Venta de activos", tipo: "INGRESO", nivel: 4, codigoPadre: "I-3-2", esTitulo: false },

  // ============================================
  // GASTOS
  // ============================================
  { codigo: "G", nombre: "GASTOS", tipo: "GASTO", nivel: 1, codigoPadre: null, esTitulo: true },

  // Funcionamiento
  { codigo: "G-1", nombre: "GASTOS DE FUNCIONAMIENTO", tipo: "GASTO", nivel: 2, codigoPadre: "G", esTitulo: true },
  { codigo: "G-1-1", nombre: "SERVICIOS PERSONALES", tipo: "GASTO", nivel: 3, codigoPadre: "G-1", esTitulo: true },
  { codigo: "G-1-1-01", nombre: "Sueldos de personal de nómina", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-1", esTitulo: false },
  { codigo: "G-1-1-02", nombre: "Horas extras y festivos", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-1", esTitulo: false },
  { codigo: "G-1-1-03", nombre: "Indemnización por vacaciones", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-1", esTitulo: false },
  { codigo: "G-1-1-04", nombre: "Prima de servicios", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-1", esTitulo: false },
  { codigo: "G-1-1-05", nombre: "Prima de navidad", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-1", esTitulo: false },
  { codigo: "G-1-1-06", nombre: "Prima de vacaciones", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-1", esTitulo: false },
  { codigo: "G-1-1-07", nombre: "Cesantías", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-1", esTitulo: false },
  { codigo: "G-1-1-08", nombre: "Intereses sobre cesantías", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-1", esTitulo: false },
  { codigo: "G-1-1-09", nombre: "Bonificación por servicios", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-1", esTitulo: false },
  { codigo: "G-1-2", nombre: "CONTRIBUCIONES PATRONALES", tipo: "GASTO", nivel: 3, codigoPadre: "G-1", esTitulo: true },
  { codigo: "G-1-2-01", nombre: "Aportes a salud", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-2", esTitulo: false },
  { codigo: "G-1-2-02", nombre: "Aportes a pensión", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-2", esTitulo: false },
  { codigo: "G-1-2-03", nombre: "Aportes ARL", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-2", esTitulo: false },
  { codigo: "G-1-2-04", nombre: "Aportes caja de compensación", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-2", esTitulo: false },
  { codigo: "G-1-2-05", nombre: "Aportes ICBF", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-2", esTitulo: false },
  { codigo: "G-1-2-06", nombre: "Aportes SENA", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-2", esTitulo: false },
  { codigo: "G-1-3", nombre: "GASTOS GENERALES", tipo: "GASTO", nivel: 3, codigoPadre: "G-1", esTitulo: true },
  { codigo: "G-1-3-01", nombre: "Arrendamientos", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-3", esTitulo: false },
  { codigo: "G-1-3-02", nombre: "Servicios públicos", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-3", esTitulo: false },
  { codigo: "G-1-3-03", nombre: "Comunicaciones y transporte", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-3", esTitulo: false },
  { codigo: "G-1-3-04", nombre: "Seguros", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-3", esTitulo: false },
  { codigo: "G-1-3-05", nombre: "Mantenimiento", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-3", esTitulo: false },
  { codigo: "G-1-3-06", nombre: "Aseo, cafetería y vigilancia", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-3", esTitulo: false },
  { codigo: "G-1-3-07", nombre: "Impresos y publicaciones", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-3", esTitulo: false },
  { codigo: "G-1-3-08", nombre: "Gastos de viaje", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-3", esTitulo: false },
  { codigo: "G-1-3-09", nombre: "Gastos legales", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-3", esTitulo: false },
  { codigo: "G-1-3-10", nombre: "Capacitación, bienestar e incentivos", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-3", esTitulo: false },
  { codigo: "G-1-3-11", nombre: "Materiales y suministros", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-3", esTitulo: false },
  { codigo: "G-1-3-12", nombre: "Combustibles y lubricantes", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-3", esTitulo: false },
  { codigo: "G-1-3-13", nombre: "Software y licencias", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-3", esTitulo: false },
  { codigo: "G-1-3-90", nombre: "Otros gastos generales", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-3", esTitulo: false },
  { codigo: "G-1-4", nombre: "TRANSFERENCIAS CORRIENTES", tipo: "GASTO", nivel: 3, codigoPadre: "G-1", esTitulo: true },
  { codigo: "G-1-4-01", nombre: "Cuota de auditaje (Contraloría)", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-4", esTitulo: false },
  { codigo: "G-1-4-02", nombre: "Previsión social", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-4", esTitulo: false },
  { codigo: "G-1-4-03", nombre: "Sentencias y conciliaciones", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-4", esTitulo: false },
  { codigo: "G-1-4-90", nombre: "Otras transferencias corrientes", tipo: "GASTO", nivel: 4, codigoPadre: "G-1-4", esTitulo: false },

  // Servicios de la deuda
  { codigo: "G-2", nombre: "SERVICIO DE LA DEUDA", tipo: "GASTO", nivel: 2, codigoPadre: "G", esTitulo: true },
  { codigo: "G-2-1", nombre: "DEUDA INTERNA", tipo: "GASTO", nivel: 3, codigoPadre: "G-2", esTitulo: true },
  { codigo: "G-2-1-01", nombre: "Amortización deuda interna", tipo: "GASTO", nivel: 4, codigoPadre: "G-2-1", esTitulo: false },
  { codigo: "G-2-1-02", nombre: "Intereses deuda interna", tipo: "GASTO", nivel: 4, codigoPadre: "G-2-1", esTitulo: false },

  // Inversión
  { codigo: "G-3", nombre: "GASTOS DE INVERSIÓN", tipo: "GASTO", nivel: 2, codigoPadre: "G", esTitulo: true },
  { codigo: "G-3-1", nombre: "INVERSIÓN CON RECURSOS PROPIOS", tipo: "GASTO", nivel: 3, codigoPadre: "G-3", esTitulo: true },
  { codigo: "G-3-1-01", nombre: "Construcción de infraestructura", tipo: "GASTO", nivel: 4, codigoPadre: "G-3-1", esTitulo: false },
  { codigo: "G-3-1-02", nombre: "Adquisición de maquinaria y equipo", tipo: "GASTO", nivel: 4, codigoPadre: "G-3-1", esTitulo: false },
  { codigo: "G-3-1-03", nombre: "Proyectos de desarrollo social", tipo: "GASTO", nivel: 4, codigoPadre: "G-3-1", esTitulo: false },
  { codigo: "G-3-1-04", nombre: "Proyectos de educación", tipo: "GASTO", nivel: 4, codigoPadre: "G-3-1", esTitulo: false },
  { codigo: "G-3-1-05", nombre: "Proyectos de salud", tipo: "GASTO", nivel: 4, codigoPadre: "G-3-1", esTitulo: false },
  { codigo: "G-3-1-06", nombre: "Proyectos de agua y saneamiento", tipo: "GASTO", nivel: 4, codigoPadre: "G-3-1", esTitulo: false },
  { codigo: "G-3-1-90", nombre: "Otros proyectos de inversión", tipo: "GASTO", nivel: 4, codigoPadre: "G-3-1", esTitulo: false },
  { codigo: "G-3-2", nombre: "INVERSIÓN CON SGP", tipo: "GASTO", nivel: 3, codigoPadre: "G-3", esTitulo: true },
  { codigo: "G-3-2-01", nombre: "SGP - Educación", tipo: "GASTO", nivel: 4, codigoPadre: "G-3-2", esTitulo: false },
  { codigo: "G-3-2-02", nombre: "SGP - Salud", tipo: "GASTO", nivel: 4, codigoPadre: "G-3-2", esTitulo: false },
  { codigo: "G-3-2-03", nombre: "SGP - Agua potable y saneamiento", tipo: "GASTO", nivel: 4, codigoPadre: "G-3-2", esTitulo: false },
  { codigo: "G-3-2-04", nombre: "SGP - Propósito general", tipo: "GASTO", nivel: 4, codigoPadre: "G-3-2", esTitulo: false },
  { codigo: "G-3-3", nombre: "INVERSIÓN CON SGR", tipo: "GASTO", nivel: 3, codigoPadre: "G-3", esTitulo: true },
  { codigo: "G-3-3-01", nombre: "Proyectos con regalías", tipo: "GASTO", nivel: 4, codigoPadre: "G-3-3", esTitulo: false },
];
