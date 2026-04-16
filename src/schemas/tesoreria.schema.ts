import { z } from "zod";

const retencionSchema = z.object({
  tipoRetencionId: z.string().min(1),
  base: z.coerce.number().min(0),
  porcentaje: z.coerce.number().min(0),
  valor: z.coerce.number().min(0),
});

export const pagoSchema = z.object({
  fecha: z.coerce.date(),
  valor: z.coerce.number().positive("El valor debe ser positivo"),
  concepto: z.string().min(1, "El concepto es requerido"),
  medioPago: z.enum(["TRANSFERENCIA", "CHEQUE", "EFECTIVO"]),
  vigenciaId: z.string().min(1, "La vigencia es requerida"),
  rpId: z.string().min(1, "El RP es requerido"),
  terceroId: z.string().min(1, "El tercero es requerido"),
  cuentaBancariaId: z.string().min(1, "La cuenta bancaria es requerida"),
  retenciones: z.array(retencionSchema).default([]),
});

export const recaudoSchema = z.object({
  fecha: z.coerce.date(),
  valor: z.coerce.number().positive("El valor debe ser positivo"),
  concepto: z.string().min(1, "El concepto es requerido"),
  fuente: z.string().min(1, "La fuente es requerida"),
  vigenciaId: z.string().min(1, "La vigencia es requerida"),
  terceroId: z.string().optional().nullable(),
  cuentaBancariaId: z.string().min(1, "La cuenta bancaria es requerida"),
});

export type PagoInput = z.infer<typeof pagoSchema>;
export type RecaudoInput = z.infer<typeof recaudoSchema>;
