import { RolUsuario } from "@prisma/client";

const PERMISOS: Record<RolUsuario, string[]> = {
  ADMINISTRADOR: ["*"],
  JEFE_AREA: [
    "comprobante:leer",
    "comprobante:aprobar",
    "comprobante:anular",
    "cdp:leer",
    "cdp:aprobar",
    "cdp:anular",
    "rp:leer",
    "rp:aprobar",
    "rp:anular",
    "pago:leer",
    "pago:aprobar",
    "pago:anular",
    "recaudo:leer",
    "terceros:leer",
    "reportes:*",
    "vigencia:leer",
    "auditoria:leer",
  ],
  AUXILIAR: [
    "comprobante:leer",
    "comprobante:crear",
    "comprobante:editar",
    "cdp:leer",
    "cdp:crear",
    "cdp:editar",
    "rp:leer",
    "rp:crear",
    "rp:editar",
    "pago:leer",
    "pago:crear",
    "pago:editar",
    "recaudo:leer",
    "recaudo:crear",
    "terceros:leer",
    "terceros:crear",
    "terceros:editar",
    "reportes:leer",
    "vigencia:leer",
  ],
};

export function tienePermiso(rol: RolUsuario, permiso: string): boolean {
  const permisos = PERMISOS[rol];
  if (!permisos) return false;

  if (permisos.includes("*")) return true;

  // Verificar permiso exacto
  if (permisos.includes(permiso)) return true;

  // Verificar wildcard de módulo (ej: "reportes:*" cubre "reportes:leer")
  const [modulo] = permiso.split(":");
  return permisos.includes(`${modulo}:*`);
}

export function verificarPermiso(rol: RolUsuario, permiso: string): void {
  if (!tienePermiso(rol, permiso)) {
    throw new Error(`No tiene permisos para realizar esta acción: ${permiso}`);
  }
}
