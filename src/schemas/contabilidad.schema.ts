import { z } from "zod";

const movimientoSchema = z.object({
  cuentaId: z.string().min(1, "La cuenta es requerida"),
  terceroId: z.string().optional().nullable(),
  descripcion: z.string().optional().nullable(),
  debito: z.coerce.number().min(0, "El débito no puede ser negativo"),
  credito: z.coerce.number().min(0, "El crédito no puede ser negativo"),
});

export const comprobanteSchema = z.object({
  tipo: z.enum(["INGRESO", "EGRESO", "GENERAL"]),
  fecha: z.coerce.date(),
  concepto: z.string().min(1, "El concepto es requerido"),
  vigenciaId: z.string().min(1, "La vigencia es requerida"),
  movimientos: z
    .array(movimientoSchema)
    .min(2, "Debe tener al menos 2 movimientos"),
});

export type ComprobanteInput = z.infer<typeof comprobanteSchema>;
export type MovimientoInput = z.infer<typeof movimientoSchema>;
