// Plan Único de Cuentas para Entidades de Gobierno - CGN
// Basado en Resolución 533 de 2015 y sus modificaciones

import { NaturalezaCuenta, TipoCuenta } from "@prisma/client";

interface CuentaSeed {
  codigo: string;
  nombre: string;
  nivel: number;
  naturaleza: NaturalezaCuenta;
  tipo: TipoCuenta;
  codigoPadre: string | null;
  requiereTercero?: boolean;
}

export const planCuentasCGN: CuentaSeed[] = [
  // ============================
  // CLASE 1 - ACTIVOS (Naturaleza Débito)
  // ============================
  { codigo: "1", nombre: "ACTIVOS", nivel: 1, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: null },

  // Grupo 11 - Efectivo y equivalentes
  { codigo: "11", nombre: "EFECTIVO Y EQUIVALENTES AL EFECTIVO", nivel: 2, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "1" },
  { codigo: "1105", nombre: "CAJA", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "11" },
  { codigo: "110501", nombre: "Caja principal", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1105" },
  { codigo: "110502", nombre: "Cajas menores", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1105" },
  { codigo: "1110", nombre: "DEPÓSITOS EN INSTITUCIONES FINANCIERAS", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "11" },
  { codigo: "111005", nombre: "Cuenta corriente", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1110" },
  { codigo: "111006", nombre: "Cuenta de ahorros", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1110" },

  // Grupo 13 - Cuentas por cobrar
  { codigo: "13", nombre: "CUENTAS POR COBRAR", nivel: 2, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "1" },
  { codigo: "1311", nombre: "CONTRIBUCIONES, TASAS E INGRESOS NO TRIBUTARIOS", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "13" },
  { codigo: "131101", nombre: "Tasas y derechos administrativos", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1311", requiereTercero: true },
  { codigo: "1314", nombre: "PRÉSTAMOS POR COBRAR", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "13" },
  { codigo: "131401", nombre: "Préstamos concedidos", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1314", requiereTercero: true },
  { codigo: "1384", nombre: "OTRAS CUENTAS POR COBRAR", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "13" },
  { codigo: "138401", nombre: "Anticipos y avances entregados", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1384", requiereTercero: true },
  { codigo: "138490", nombre: "Otras cuentas por cobrar", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1384", requiereTercero: true },

  // Grupo 16 - Propiedad, planta y equipo
  { codigo: "16", nombre: "PROPIEDADES, PLANTA Y EQUIPO", nivel: 2, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "1" },
  { codigo: "1635", nombre: "BIENES MUEBLES EN BODEGA", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "16" },
  { codigo: "163501", nombre: "Maquinaria y equipo", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1635" },
  { codigo: "1637", nombre: "PROPIEDADES, PLANTA Y EQUIPO NO EXPLOTADOS", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "16" },
  { codigo: "163702", nombre: "Construcciones en curso", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1637" },
  { codigo: "1640", nombre: "EDIFICACIONES", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "16" },
  { codigo: "164001", nombre: "Edificaciones", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1640" },
  { codigo: "1655", nombre: "MAQUINARIA Y EQUIPO", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "16" },
  { codigo: "165501", nombre: "Maquinaria y equipo", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1655" },
  { codigo: "1660", nombre: "EQUIPO MÉDICO Y CIENTÍFICO", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "16" },
  { codigo: "166001", nombre: "Equipo médico y científico", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1660" },
  { codigo: "1665", nombre: "MUEBLES, ENSERES Y EQUIPO DE OFICINA", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "16" },
  { codigo: "166501", nombre: "Muebles, enseres y equipo de oficina", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1665" },
  { codigo: "1670", nombre: "EQUIPOS DE COMUNICACIÓN Y COMPUTACIÓN", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "16" },
  { codigo: "167001", nombre: "Equipos de comunicación y computación", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1670" },
  { codigo: "1675", nombre: "EQUIPO DE TRANSPORTE, TRACCIÓN Y ELEVACIÓN", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "16" },
  { codigo: "167501", nombre: "Equipo de transporte, tracción y elevación", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "1675" },
  { codigo: "1685", nombre: "DEPRECIACIÓN ACUMULADA (CR)", nivel: 3, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "16" },
  { codigo: "168501", nombre: "Edificaciones", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "1685" },
  { codigo: "168505", nombre: "Maquinaria y equipo", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "1685" },
  { codigo: "168510", nombre: "Muebles, enseres y equipo de oficina", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "1685" },
  { codigo: "168515", nombre: "Equipos de comunicación y computación", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "1685" },
  { codigo: "168520", nombre: "Equipo de transporte", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "1685" },

  // ============================
  // CLASE 2 - PASIVOS (Naturaleza Crédito)
  // ============================
  { codigo: "2", nombre: "PASIVOS", nivel: 1, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: null },

  // Grupo 24 - Cuentas por pagar
  { codigo: "24", nombre: "CUENTAS POR PAGAR", nivel: 2, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "2" },
  { codigo: "2401", nombre: "ADQUISICIÓN DE BIENES Y SERVICIOS NACIONALES", nivel: 3, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "24" },
  { codigo: "240101", nombre: "Bienes y servicios", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2401", requiereTercero: true },
  { codigo: "2436", nombre: "RETENCIÓN EN LA FUENTE E IMPUESTO DE TIMBRE", nivel: 3, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "24" },
  { codigo: "243601", nombre: "Retención en la fuente - salarios", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2436" },
  { codigo: "243606", nombre: "Retención en la fuente - honorarios", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2436" },
  { codigo: "243609", nombre: "Retención en la fuente - servicios", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2436" },
  { codigo: "243611", nombre: "Retención en la fuente - compras", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2436" },
  { codigo: "243615", nombre: "Retención en la fuente - arrendamientos", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2436" },
  { codigo: "2440", nombre: "IMPUESTOS, CONTRIBUCIONES Y TASAS POR PAGAR", nivel: 3, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "24" },
  { codigo: "244001", nombre: "Impuesto de industria y comercio", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2440" },
  { codigo: "244002", nombre: "Impuesto al valor agregado - IVA", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2440" },
  { codigo: "244005", nombre: "Retención de ICA", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2440" },
  { codigo: "244006", nombre: "Retención de IVA", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2440" },
  { codigo: "244008", nombre: "Estampillas", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2440" },

  // Grupo 25 - Obligaciones laborales
  { codigo: "25", nombre: "BENEFICIOS A EMPLEADOS", nivel: 2, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "2" },
  { codigo: "2505", nombre: "SALARIOS Y PRESTACIONES SOCIALES", nivel: 3, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "25" },
  { codigo: "250501", nombre: "Salarios por pagar", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2505", requiereTercero: true },
  { codigo: "250502", nombre: "Cesantías", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2505" },
  { codigo: "250503", nombre: "Intereses sobre cesantías", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2505" },
  { codigo: "250504", nombre: "Vacaciones", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2505" },
  { codigo: "250505", nombre: "Prima de servicios", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2505" },
  { codigo: "250506", nombre: "Prima de navidad", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "2505" },

  // ============================
  // CLASE 3 - PATRIMONIO (Naturaleza Crédito)
  // ============================
  { codigo: "3", nombre: "PATRIMONIO", nivel: 1, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: null },
  { codigo: "31", nombre: "PATRIMONIO DE LAS ENTIDADES DE GOBIERNO", nivel: 2, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "3" },
  { codigo: "3105", nombre: "CAPITAL FISCAL", nivel: 3, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "31" },
  { codigo: "310501", nombre: "Capital fiscal", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "3105" },
  { codigo: "3109", nombre: "RESULTADOS DE EJERCICIOS ANTERIORES", nivel: 3, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "31" },
  { codigo: "310901", nombre: "Resultados de ejercicios anteriores", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "3109" },
  { codigo: "3110", nombre: "RESULTADO DEL EJERCICIO", nivel: 3, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "31" },
  { codigo: "311001", nombre: "Resultado del ejercicio", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "3110" },

  // ============================
  // CLASE 4 - INGRESOS (Naturaleza Crédito)
  // ============================
  { codigo: "4", nombre: "INGRESOS", nivel: 1, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: null },
  { codigo: "41", nombre: "INGRESOS FISCALES", nivel: 2, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "4" },
  { codigo: "4105", nombre: "INGRESOS TRIBUTARIOS", nivel: 3, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "41" },
  { codigo: "410501", nombre: "Impuesto predial unificado", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "4105" },
  { codigo: "410502", nombre: "Impuesto de industria y comercio", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "4105" },
  { codigo: "410503", nombre: "Sobretasa a la gasolina", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "4105" },
  { codigo: "410590", nombre: "Otros ingresos tributarios", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "4105" },
  { codigo: "4110", nombre: "INGRESOS NO TRIBUTARIOS", nivel: 3, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "41" },
  { codigo: "411001", nombre: "Tasas y derechos", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "4110" },
  { codigo: "411002", nombre: "Multas y sanciones", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "4110" },
  { codigo: "411090", nombre: "Otros ingresos no tributarios", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "4110" },
  { codigo: "44", nombre: "TRANSFERENCIAS Y SUBVENCIONES", nivel: 2, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "4" },
  { codigo: "4428", nombre: "TRANSFERENCIAS DEL GOBIERNO CENTRAL", nivel: 3, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "44" },
  { codigo: "442801", nombre: "Sistema general de participaciones", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "4428" },
  { codigo: "442802", nombre: "Sistema general de regalías", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "4428" },

  // ============================
  // CLASE 5 - GASTOS (Naturaleza Débito)
  // ============================
  { codigo: "5", nombre: "GASTOS", nivel: 1, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: null },
  { codigo: "51", nombre: "DE ADMINISTRACIÓN", nivel: 2, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "5" },
  { codigo: "5101", nombre: "SUELDOS Y SALARIOS", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "51" },
  { codigo: "510101", nombre: "Sueldos del personal", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5101", requiereTercero: true },
  { codigo: "510102", nombre: "Horas extras y festivos", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5101" },
  { codigo: "5102", nombre: "CONTRIBUCIONES IMPUTADAS", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "51" },
  { codigo: "510201", nombre: "Incapacidades", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5102" },
  { codigo: "5103", nombre: "CONTRIBUCIONES EFECTIVAS", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "51" },
  { codigo: "510301", nombre: "Aportes a salud", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5103" },
  { codigo: "510302", nombre: "Aportes a pensión", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5103" },
  { codigo: "510303", nombre: "Aportes ARL", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5103" },
  { codigo: "510304", nombre: "Aportes a caja de compensación", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5103" },
  { codigo: "510305", nombre: "Aportes ICBF", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5103" },
  { codigo: "510306", nombre: "Aportes SENA", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5103" },
  { codigo: "5104", nombre: "PRESTACIONES SOCIALES", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "51" },
  { codigo: "510401", nombre: "Cesantías", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5104" },
  { codigo: "510402", nombre: "Intereses sobre cesantías", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5104" },
  { codigo: "510403", nombre: "Vacaciones", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5104" },
  { codigo: "510404", nombre: "Prima de servicios", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5104" },
  { codigo: "510405", nombre: "Prima de navidad", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5104" },
  { codigo: "5111", nombre: "GENERALES", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "51" },
  { codigo: "511101", nombre: "Arrendamientos", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5111", requiereTercero: true },
  { codigo: "511102", nombre: "Servicios públicos", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5111", requiereTercero: true },
  { codigo: "511103", nombre: "Comunicaciones y transporte", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5111" },
  { codigo: "511104", nombre: "Seguros", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5111" },
  { codigo: "511105", nombre: "Mantenimiento", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5111" },
  { codigo: "511106", nombre: "Aseo, cafetería y vigilancia", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5111" },
  { codigo: "511107", nombre: "Impresos y publicaciones", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5111" },
  { codigo: "511108", nombre: "Gastos de viaje", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5111" },
  { codigo: "511109", nombre: "Gastos legales", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5111" },
  { codigo: "511110", nombre: "Capacitación", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5111" },
  { codigo: "511190", nombre: "Otros gastos generales", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5111" },
  { codigo: "5120", nombre: "IMPUESTOS, CONTRIBUCIONES Y TASAS", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "51" },
  { codigo: "512001", nombre: "Impuesto predial unificado", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5120" },
  { codigo: "512002", nombre: "Impuesto sobre vehículos", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5120" },
  { codigo: "53", nombre: "PROVISIONES, DEPRECIACIONES Y AMORTIZACIONES", nivel: 2, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "5" },
  { codigo: "5360", nombre: "DEPRECIACIÓN DE PROPIEDADES, PLANTA Y EQUIPO", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "53" },
  { codigo: "536001", nombre: "Depreciación edificaciones", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5360" },
  { codigo: "536005", nombre: "Depreciación maquinaria y equipo", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5360" },
  { codigo: "536010", nombre: "Depreciación muebles y enseres", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5360" },
  { codigo: "536015", nombre: "Depreciación equipos de computación", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5360" },
  { codigo: "536020", nombre: "Depreciación equipo de transporte", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5360" },

  // Gastos por contratos (honorarios, servicios)
  { codigo: "52", nombre: "DE OPERACIÓN", nivel: 2, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "5" },
  { codigo: "5201", nombre: "HONORARIOS", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "52" },
  { codigo: "520101", nombre: "Honorarios", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5201", requiereTercero: true },
  { codigo: "5202", nombre: "SERVICIOS", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "52" },
  { codigo: "520201", nombre: "Servicios técnicos", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5202", requiereTercero: true },
  { codigo: "5204", nombre: "COMPRAS", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "52" },
  { codigo: "520401", nombre: "Materiales y suministros", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "5204", requiereTercero: true },

  // ============================
  // CLASE 8 - CUENTAS DE ORDEN DEUDORAS
  // ============================
  { codigo: "8", nombre: "CUENTAS DE ORDEN DEUDORAS", nivel: 1, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: null },
  { codigo: "81", nombre: "DERECHOS CONTINGENTES", nivel: 2, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "8" },
  { codigo: "8120", nombre: "LITIGIOS Y MECANISMOS ALTERNATIVOS DE SOLUCIÓN", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "81" },
  { codigo: "812001", nombre: "Laborales", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "8120" },
  { codigo: "83", nombre: "DEUDORAS DE CONTROL", nivel: 2, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "8" },
  { codigo: "8355", nombre: "BIENES ENTREGADOS A TERCEROS", nivel: 3, naturaleza: "DEBITO", tipo: "TITULO", codigoPadre: "83" },
  { codigo: "835501", nombre: "Bienes entregados en comodato", nivel: 4, naturaleza: "DEBITO", tipo: "MOVIMIENTO", codigoPadre: "8355" },

  // ============================
  // CLASE 9 - CUENTAS DE ORDEN ACREEDORAS
  // ============================
  { codigo: "9", nombre: "CUENTAS DE ORDEN ACREEDORAS", nivel: 1, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: null },
  { codigo: "91", nombre: "RESPONSABILIDADES CONTINGENTES", nivel: 2, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "9" },
  { codigo: "9120", nombre: "LITIGIOS Y MECANISMOS ALTERNATIVOS DE SOLUCIÓN", nivel: 3, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "91" },
  { codigo: "912001", nombre: "Laborales", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "9120" },
  { codigo: "93", nombre: "ACREEDORAS DE CONTROL", nivel: 2, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "9" },
  { codigo: "9355", nombre: "BIENES RECIBIDOS DE TERCEROS", nivel: 3, naturaleza: "CREDITO", tipo: "TITULO", codigoPadre: "93" },
  { codigo: "935501", nombre: "Bienes recibidos en comodato", nivel: 4, naturaleza: "CREDITO", tipo: "MOVIMIENTO", codigoPadre: "9355" },
];
