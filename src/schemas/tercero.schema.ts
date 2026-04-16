import { z } from "zod";

export const terceroSchema = z.object({
  tipoDocumento: z.enum(["CC", "CE", "NIT", "PASAPORTE", "TI"]),
  numeroDocumento: z.string().min(1, "El número de documento es requerido"),
  digitoVerificacion: z.string().optional().nullable(),
  razonSocial: z.string().optional().nullable(),
  primerNombre: z.string().optional().nullable(),
  segundoNombre: z.string().optional().nullable(),
  primerApellido: z.string().optional().nullable(),
  segundoApellido: z.string().optional().nullable(),
  tipoPersona: z.enum(["NATURAL", "JURIDICA"]),
  direccion: z.string().optional().nullable(),
  ciudad: z.string().optional().nullable(),
  departamento: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
  responsableIva: z.boolean().default(false),
  granContribuyente: z.boolean().default(false),
  regimenTributario: z
    .enum([
      "RESPONSABLE_IVA",
      "NO_RESPONSABLE_IVA",
      "GRAN_CONTRIBUYENTE",
      "REGIMEN_SIMPLE",
    ])
    .optional()
    .nullable(),
  actividadEconomica: z.string().optional().nullable(),
});

export type TerceroInput = z.infer<typeof terceroSchema>;
