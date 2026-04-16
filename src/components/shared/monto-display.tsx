"use client";

import { formatearMoneda } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MontoDisplay({
  valor,
  className,
}: {
  valor: number | string;
  className?: string;
}) {
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {formatearMoneda(num)}
    </span>
  );
}
