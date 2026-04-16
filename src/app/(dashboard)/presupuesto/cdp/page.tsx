"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useVigencia } from "@/hooks/use-vigencia";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { MontoDisplay } from "@/components/shared/monto-display";
import { formatearFecha } from "@/lib/constants";
import { Plus } from "lucide-react";

export default function CDPPage() {
  const { vigenciaId } = useVigencia();
  const [cdps, setCdps] = useState<any[]>([]);

  useEffect(() => {
    if (!vigenciaId) return;
    fetch(`/api/presupuesto/cdp?vigenciaId=${vigenciaId}`)
      .then((r) => r.json())
      .then((data) => setCdps(data.data || []))
      .catch(() => {});
  }, [vigenciaId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Certificados de Disponibilidad Presupuestal</h2>
          <p className="text-slate-500">CDP - Reserva de apropiación presupuestal</p>
        </div>
        <Link href="/presupuesto/cdp/nuevo">
          <Button><Plus className="h-4 w-4 mr-2" />Nuevo CDP</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left p-3">No.</th>
                <th className="text-left p-3">Fecha</th>
                <th className="text-left p-3">Objeto</th>
                <th className="text-left p-3">Solicitante</th>
                <th className="text-left p-3">Rubros</th>
                <th className="text-right p-3">Valor Total</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cdps.map((cdp) => {
                const total = cdp.items?.reduce(
                  (s: number, i: any) => s + parseFloat(i.valor),
                  0
                ) || 0;
                return (
                  <tr key={cdp.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold">{cdp.numero}</td>
                    <td className="p-3">{formatearFecha(cdp.fecha)}</td>
                    <td className="p-3 max-w-xs truncate">{cdp.objeto}</td>
                    <td className="p-3 text-slate-500">{cdp.solicitante}</td>
                    <td className="p-3 text-xs text-slate-500">
                      {cdp.items?.map((i: any) => i.rubro?.codigo).join(", ")}
                    </td>
                    <td className="p-3 text-right">
                      <MontoDisplay valor={total} />
                    </td>
                    <td className="p-3"><EstadoBadge estado={cdp.estado} /></td>
                    <td className="p-3">
                      <Link href={`/presupuesto/cdp/${cdp.id}`}>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {cdps.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No hay CDPs registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
