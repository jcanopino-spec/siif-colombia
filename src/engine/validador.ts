import { prisma } from "@/lib/prisma";

interface ResultadoValidacion {
  valido: boolean;
  errores: string[];
  advertencias: string[];
}

interface ReglaCondicion {
  campo: string;
  operador: "eq" | "neq" | "gt" | "lt" | "gte" | "lte";
  valor: number | string | boolean;
}

interface ReglaAccion {
  tipo: "BLOQUEAR" | "ADVERTIR" | "REGISTRAR";
  mensaje: string;
}

function evaluarCondicion(
  condicion: ReglaCondicion,
  datos: Record<string, unknown>
): boolean {
  const valorCampo = datos[condicion.campo];
  if (valorCampo === undefined) return true; // Si no hay dato, no aplica la regla

  const a = Number(valorCampo);
  const b =
    typeof condicion.valor === "string"
      ? Number(datos[condicion.valor] ?? condicion.valor)
      : Number(condicion.valor);

  switch (condicion.operador) {
    case "eq":
      return a === b;
    case "neq":
      return a !== b;
    case "gt":
      return a > b;
    case "lt":
      return a < b;
    case "gte":
      return a >= b;
    case "lte":
      return a <= b;
    default:
      return true;
  }
}

export async function validarOperacion(
  modulo: string,
  datos: Record<string, unknown>
): Promise<ResultadoValidacion> {
  const reglas = await prisma.reglaNormativa.findMany({
    where: { modulo, activa: true },
  });

  const errores: string[] = [];
  const advertencias: string[] = [];

  for (const regla of reglas) {
    const condicion = (typeof regla.condicion === "string" ? JSON.parse(regla.condicion) : regla.condicion) as ReglaCondicion;
    const accion = (typeof regla.accion === "string" ? JSON.parse(regla.accion) : regla.accion) as ReglaAccion;

    const cumple = evaluarCondicion(condicion, datos);

    if (!cumple) {
      if (accion.tipo === "BLOQUEAR") {
        errores.push(`[${regla.normativa || regla.nombre}] ${accion.mensaje}`);
      } else if (accion.tipo === "ADVERTIR") {
        advertencias.push(
          `[${regla.normativa || regla.nombre}] ${accion.mensaje}`
        );
      }
    }
  }

  return {
    valido: errores.length === 0,
    errores,
    advertencias,
  };
}
