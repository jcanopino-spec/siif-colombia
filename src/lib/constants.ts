export const NOMBRE_APP = "SIIF Colombia";
export const NOMBRE_APP_CORTO = "SIIF";
export const DESCRIPCION_APP =
  "Sistema Integrado de Información Financiera para Entidades Públicas";

// Formato de moneda colombiana
export function formatearMoneda(valor: number | string): string {
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// Formato de fecha colombiana
export function formatearFecha(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

// Estados de documento con colores
export const ESTADOS_DOCUMENTO = {
  BORRADOR: { label: "Borrador", color: "bg-gray-100 text-gray-800" },
  PENDIENTE_APROBACION: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
  },
  APROBADO: { label: "Aprobado", color: "bg-green-100 text-green-800" },
  ANULADO: { label: "Anulado", color: "bg-red-100 text-red-800" },
} as const;

// Tipos de documento de identidad
export const TIPOS_DOCUMENTO = {
  CC: "Cédula de Ciudadanía",
  CE: "Cédula de Extranjería",
  NIT: "NIT",
  PASAPORTE: "Pasaporte",
  TI: "Tarjeta de Identidad",
} as const;

// Tipos de comprobante
export const TIPOS_COMPROBANTE = {
  INGRESO: "Comprobante de Ingreso",
  EGRESO: "Comprobante de Egreso",
  GENERAL: "Comprobante General",
} as const;

// Tipos de compromiso
export const TIPOS_COMPROMISO = {
  CONTRATO: "Contrato",
  ORDEN_COMPRA: "Orden de Compra",
  ORDEN_SERVICIO: "Orden de Servicio",
  NOMINA: "Nómina",
  SERVICIOS_PUBLICOS: "Servicios Públicos",
  TRANSFERENCIAS: "Transferencias",
  SENTENCIAS: "Sentencias",
  OTROS: "Otros",
} as const;

// Medios de pago
export const MEDIOS_PAGO = {
  TRANSFERENCIA: "Transferencia Electrónica",
  CHEQUE: "Cheque",
  EFECTIVO: "Efectivo",
} as const;
