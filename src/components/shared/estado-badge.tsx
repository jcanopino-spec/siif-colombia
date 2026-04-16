"use client";

import { Badge } from "@/components/ui/badge";
import { ESTADOS_DOCUMENTO } from "@/lib/constants";
import { EstadoDocumento } from "@prisma/client";

export function EstadoBadge({ estado }: { estado: EstadoDocumento }) {
  const config = ESTADOS_DOCUMENTO[estado];
  return (
    <Badge variant="outline" className={config.color}>
      {config.label}
    </Badge>
  );
}
