import { z } from "zod";

const itemCdpSchema = z.object({
  rubroId: z.string().min(1, "El rubro es requerido"),
  valor: z.coerce.number().positive("El valor debe ser positivo"),
});

export const cdpSchema = z.object({
  fecha: z.coerce.date(),
  objeto: z.string().min(1, "El objeto del gasto es requerido"),
  vigenciaId: z.string().min(1, "La vigencia es requerida"),
  solicitante: z.string().min(1, "El solicitante es requerido"),
  dependencia: z.string().min(1, "La dependencia es requerida"),
  items: z.array(itemCdpSchema).min(1, "Debe tener al menos un rubro"),
});

const itemRpSchema = z.object({
  rubroId: z.string().min(1, "El rubro es requerido"),
  valor: z.coerce.number().positive("El valor debe ser positivo"),
});

export const rpSchema = z.object({
  fecha: z.coerce.date(),
  objeto: z.string().min(1, "El objeto es requerido"),
  vigenciaId: z.string().min(1, "La vigencia es requerida"),
  cdpId: z.string().min(1, "El CDP es requerido"),
  terceroId: z.string().min(1, "El tercero es requerido"),
  tipoCompromiso: z.enum([
    "CONTRATO",
    "ORDEN_COMPRA",
    "ORDEN_SERVICIO",
    "NOMINA",
    "SERVICIOS_PUBLICOS",
    "TRANSFERENCIAS",
    "SENTENCIAS",
    "OTROS",
  ]),
  numeroContrato: z.string().optional().nullable(),
  items: z.array(itemRpSchema).min(1, "Debe tener al menos un rubro"),
});

export const apropiacionSchema = z.object({
  vigenciaId: z.string().min(1, "La vigencia es requerida"),
  rubroId: z.string().min(1, "El rubro es requerido"),
  apropiacionInicial: z.coerce
    .number()
    .min(0, "La apropiación debe ser positiva"),
});

export type CDPInput = z.infer<typeof cdpSchema>;
export type RPInput = z.infer<typeof rpSchema>;
export type ApropiacionInput = z.infer<typeof apropiacionSchema>;
