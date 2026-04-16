// Tipos de retención vigentes para Colombia
// Actualizar porcentajes y bases según cambios normativos anuales

import { TipoImpuesto } from "@prisma/client";

interface TipoRetencionSeed {
  codigo: string;
  nombre: string;
  impuesto: TipoImpuesto;
  porcentaje: number;    // En decimal: 0.11 = 11%
  baseMinima: number;    // En pesos o UVT según baseMinimaEnUvt
  baseMinimaEnUvt: boolean;
  cuentaContableId?: string; // Se vincula después del seed de cuentas
}

export const tiposRetencion: TipoRetencionSeed[] = [
  // ========================
  // RETENCIÓN EN LA FUENTE
  // ========================
  {
    codigo: "RFTE_SALARIOS",
    nombre: "Retención en la fuente - Salarios",
    impuesto: "RETENCION_FUENTE",
    porcentaje: 0.0000, // Varía según tabla, se calcula
    baseMinima: 0,
    baseMinimaEnUvt: false,
  },
  {
    codigo: "RFTE_HONORARIOS_DJ",
    nombre: "Retención en la fuente - Honorarios (declarante)",
    impuesto: "RETENCION_FUENTE",
    porcentaje: 0.1100,
    baseMinima: 0,
    baseMinimaEnUvt: false,
  },
  {
    codigo: "RFTE_HONORARIOS_NDJ",
    nombre: "Retención en la fuente - Honorarios (no declarante)",
    impuesto: "RETENCION_FUENTE",
    porcentaje: 0.1000,
    baseMinima: 0,
    baseMinimaEnUvt: false,
  },
  {
    codigo: "RFTE_SERVICIOS_DJ",
    nombre: "Retención en la fuente - Servicios (declarante)",
    impuesto: "RETENCION_FUENTE",
    porcentaje: 0.0400,
    baseMinima: 4,
    baseMinimaEnUvt: true,
  },
  {
    codigo: "RFTE_SERVICIOS_NDJ",
    nombre: "Retención en la fuente - Servicios (no declarante)",
    impuesto: "RETENCION_FUENTE",
    porcentaje: 0.0600,
    baseMinima: 4,
    baseMinimaEnUvt: true,
  },
  {
    codigo: "RFTE_COMPRAS_DJ",
    nombre: "Retención en la fuente - Compras (declarante)",
    impuesto: "RETENCION_FUENTE",
    porcentaje: 0.0250,
    baseMinima: 27,
    baseMinimaEnUvt: true,
  },
  {
    codigo: "RFTE_COMPRAS_NDJ",
    nombre: "Retención en la fuente - Compras (no declarante)",
    impuesto: "RETENCION_FUENTE",
    porcentaje: 0.0350,
    baseMinima: 27,
    baseMinimaEnUvt: true,
  },
  {
    codigo: "RFTE_ARRENDAMIENTO_INM",
    nombre: "Retención en la fuente - Arrendamiento inmuebles",
    impuesto: "RETENCION_FUENTE",
    porcentaje: 0.0350,
    baseMinima: 27,
    baseMinimaEnUvt: true,
  },
  {
    codigo: "RFTE_ARRENDAMIENTO_MUE",
    nombre: "Retención en la fuente - Arrendamiento muebles",
    impuesto: "RETENCION_FUENTE",
    porcentaje: 0.0400,
    baseMinima: 0,
    baseMinimaEnUvt: false,
  },
  {
    codigo: "RFTE_CONTRATOS_CONST",
    nombre: "Retención en la fuente - Contratos de construcción",
    impuesto: "RETENCION_FUENTE",
    porcentaje: 0.0200,
    baseMinima: 27,
    baseMinimaEnUvt: true,
  },

  // ========================
  // RETENCIÓN DE IVA
  // ========================
  {
    codigo: "RIVA_15",
    nombre: "Retención de IVA - 15%",
    impuesto: "RETENCION_IVA",
    porcentaje: 0.1500,
    baseMinima: 4,
    baseMinimaEnUvt: true,
  },

  // ========================
  // RETENCIÓN DE ICA
  // ========================
  {
    codigo: "RICA_COMERCIAL",
    nombre: "Retención de ICA - Actividad comercial",
    impuesto: "RETENCION_ICA",
    porcentaje: 0.0044,  // 4.4 por mil (varía por municipio)
    baseMinima: 0,
    baseMinimaEnUvt: false,
  },
  {
    codigo: "RICA_SERVICIOS",
    nombre: "Retención de ICA - Actividad de servicios",
    impuesto: "RETENCION_ICA",
    porcentaje: 0.0066,  // 6.6 por mil (varía por municipio)
    baseMinima: 0,
    baseMinimaEnUvt: false,
  },
  {
    codigo: "RICA_INDUSTRIAL",
    nombre: "Retención de ICA - Actividad industrial",
    impuesto: "RETENCION_ICA",
    porcentaje: 0.0030,  // 3.0 por mil (varía por municipio)
    baseMinima: 0,
    baseMinimaEnUvt: false,
  },

  // ========================
  // ESTAMPILLAS
  // ========================
  {
    codigo: "ESTAMPILLA_PRO_CULTURA",
    nombre: "Estampilla Pro-cultura",
    impuesto: "ESTAMPILLA",
    porcentaje: 0.0200,  // 2% (varía por municipio/departamento)
    baseMinima: 0,
    baseMinimaEnUvt: false,
  },
  {
    codigo: "ESTAMPILLA_PRO_DLLO",
    nombre: "Estampilla Pro-desarrollo",
    impuesto: "ESTAMPILLA",
    porcentaje: 0.0100,  // 1% (varía por municipio/departamento)
    baseMinima: 0,
    baseMinimaEnUvt: false,
  },
  {
    codigo: "ESTAMPILLA_PRO_ADULTO_MAYOR",
    nombre: "Estampilla Pro-adulto mayor",
    impuesto: "ESTAMPILLA",
    porcentaje: 0.0200,  // 2%
    baseMinima: 0,
    baseMinimaEnUvt: false,
  },

  // ========================
  // CONTRIBUCIONES
  // ========================
  {
    codigo: "CONTRIB_ESPECIAL_5",
    nombre: "Contribución especial 5% (Ley 418)",
    impuesto: "CONTRIBUCION",
    porcentaje: 0.0500,
    baseMinima: 0,
    baseMinimaEnUvt: false,
  },
];
