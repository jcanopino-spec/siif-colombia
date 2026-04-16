"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useVigencia } from "@/hooks/use-vigencia";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { MontoDisplay } from "@/components/shared/monto-display";
import { formatearFecha, MEDIOS_PAGO } from "@/lib/constants";
import { Plus } from "lucide-react";

export default function PagosPage() {
  const { vigenciaId } = useVigencia();
  const [pagos, setPagos] = useState<any[]>([]);

  useEffect(() => {
    if (!vigenciaId) return;
    fetch(`/api/tesoreria/pagos?vigenciaId=${vigenciaId}`)
      .then((r) => r.json())
      .then((data) => setPagos(data.data || []))
      .catch(() => {});
  }, [vigenciaId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ordenes de Pago</h2>
          <p className="text-slate-500">Gestión de pagos a terceros con retenciones</p>
        </div>
        <Link href="/tesoreria/pagos/nuevo">
          <Button><Plus className="h-4 w-4 mr-2" />Nuevo Pago</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left p-3">No.</th>
                <th className="text-left p-3">Fecha</th>
                <th className="text-left p-3">Tercero</th>
                <th className="text-left p-3">RP</th>
                <th className="text-left p-3">Medio</th>
                <th className="text-right p-3">Valor Bruto</th>
                <th className="text-right p-3">Retenciones</th>
                <th className="text-right p-3">Neto</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => {
                const totalRet = p.retenciones?.reduce((s: number, r: any) => s + parseFloat(r.valor), 0) || 0;
                return (
                  <tr key={p.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold">{p.numero}</td>
                    <td className="p-3">{formatearFecha(p.fecha)}</td>
                    <td className="p-3">{p.tercero?.nombreCompleto}</td>
                    <td className="p-3 font-mono">RP-{p.rp?.numero}</td>
                    <td className="p-3 text-xs">{MEDIOS_PAGO[p.medioPago as keyof typeof MEDIOS_PAGO]}</td>
                    <td className="p-3 text-right"><MontoDisplay valor={p.valor} /></td>
                    <td className="p-3 text-right text-red-600"><MontoDisplay valor={totalRet} /></td>
                    <td className="p-3 text-right font-medium"><MontoDisplay valor={p.valorNeto} /></td>
                    <td className="p-3"><EstadoBadge estado={p.estado} /></td>
                    <td className="p-3">
                      <Link href={`/tesoreria/pagos/${p.id}`}>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {pagos.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">No hay pagos registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
