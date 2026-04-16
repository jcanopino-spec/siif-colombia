"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useVigencia } from "@/hooks/use-vigencia";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { MontoDisplay } from "@/components/shared/monto-display";
import { formatearFecha, TIPOS_COMPROBANTE } from "@/lib/constants";
import { Plus } from "lucide-react";

export default function ComprobantesPage() {
  const { vigenciaId } = useVigencia();
  const [comprobantes, setComprobantes] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!vigenciaId) return;
    fetch(`/api/contabilidad/comprobantes?vigenciaId=${vigenciaId}&page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        setComprobantes(data.data || []);
        setTotal(data.total || 0);
      })
      .catch(() => {});
  }, [vigenciaId, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comprobantes Contables</h2>
          <p className="text-slate-500">Gestión de comprobantes de ingreso, egreso y generales</p>
        </div>
        <Link href="/contabilidad/comprobantes/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Comprobante
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left p-3">No.</th>
                <th className="text-left p-3">Tipo</th>
                <th className="text-left p-3">Fecha</th>
                <th className="text-left p-3">Concepto</th>
                <th className="text-right p-3">Valor</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3">Creado por</th>
                <th className="text-left p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comprobantes.map((c) => {
                const totalDebitos = c.movimientos?.reduce(
                  (s: number, m: any) => s + parseFloat(m.debito || 0),
                  0
                ) || 0;

                return (
                  <tr key={c.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold">{c.numero}</td>
                    <td className="p-3">
                      {TIPOS_COMPROBANTE[c.tipo as keyof typeof TIPOS_COMPROBANTE]}
                    </td>
                    <td className="p-3">{formatearFecha(c.fecha)}</td>
                    <td className="p-3 max-w-xs truncate">{c.concepto}</td>
                    <td className="p-3 text-right">
                      <MontoDisplay valor={totalDebitos} />
                    </td>
                    <td className="p-3">
                      <EstadoBadge estado={c.estado} />
                    </td>
                    <td className="p-3 text-slate-500">{c.creadoPor?.nombre}</td>
                    <td className="p-3">
                      <Link href={`/contabilidad/comprobantes/${c.id}`}>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {comprobantes.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No hay comprobantes registrados
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
