"use client";

import { useEffect, useState } from "react";
import { useVigencia } from "@/hooks/use-vigencia";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MontoDisplay } from "@/components/shared/monto-display";

export default function EjecucionPage() {
  const { vigenciaId, anio } = useVigencia();
  const [ejecucion, setEjecucion] = useState<any[]>([]);

  useEffect(() => {
    if (!vigenciaId) return;
    fetch(`/api/presupuesto/ejecucion?vigenciaId=${vigenciaId}`)
      .then((r) => r.json())
      .then((data) => setEjecucion(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [vigenciaId]);

  const totales = ejecucion.reduce(
    (acc, row) => ({
      apropiacion: acc.apropiacion + (row.apropiacionDefinitiva || 0),
      cdp: acc.cdp + (row.cdp || 0),
      compromisos: acc.compromisos + (row.compromisos || 0),
      pagos: acc.pagos + (row.pagos || 0),
    }),
    { apropiacion: 0, cdp: 0, compromisos: 0, pagos: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Ejecución Presupuestal de Gastos</h2>
        <p className="text-slate-500">Vigencia {anio} - Estado de la ejecución por rubro</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-slate-500">Apropiación Definitiva</p>
            <MontoDisplay valor={totales.apropiacion} className="text-lg font-bold" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-slate-500">CDP Expedidos</p>
            <MontoDisplay valor={totales.cdp} className="text-lg font-bold text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-slate-500">Compromisos (RP)</p>
            <MontoDisplay valor={totales.compromisos} className="text-lg font-bold text-orange-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-slate-500">Pagos</p>
            <MontoDisplay valor={totales.pagos} className="text-lg font-bold text-green-600" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle por Rubro</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left p-3">Código</th>
                  <th className="text-left p-3">Rubro</th>
                  <th className="text-right p-3">Aprop. Inicial</th>
                  <th className="text-right p-3">Adiciones</th>
                  <th className="text-right p-3">Reducciones</th>
                  <th className="text-right p-3">Definitiva</th>
                  <th className="text-right p-3">CDP</th>
                  <th className="text-right p-3">Compromisos</th>
                  <th className="text-right p-3">Pagos</th>
                  <th className="text-right p-3">Saldo</th>
                  <th className="text-right p-3">% Ejec.</th>
                </tr>
              </thead>
              <tbody>
                {ejecucion.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-mono text-xs">{row.rubroCodigo}</td>
                    <td className="p-3">{row.rubroNombre}</td>
                    <td className="p-3 text-right"><MontoDisplay valor={row.apropiacionInicial} /></td>
                    <td className="p-3 text-right"><MontoDisplay valor={row.adiciones} /></td>
                    <td className="p-3 text-right"><MontoDisplay valor={row.reducciones} /></td>
                    <td className="p-3 text-right font-medium"><MontoDisplay valor={row.apropiacionDefinitiva} /></td>
                    <td className="p-3 text-right"><MontoDisplay valor={row.cdp} /></td>
                    <td className="p-3 text-right"><MontoDisplay valor={row.compromisos} /></td>
                    <td className="p-3 text-right"><MontoDisplay valor={row.pagos} /></td>
                    <td className="p-3 text-right"><MontoDisplay valor={row.saldoPorComprometer} /></td>
                    <td className="p-3 text-right">
                      <span className={
                        row.porcentajeEjecucion > 90 ? "text-red-600 font-bold" :
                        row.porcentajeEjecucion > 70 ? "text-yellow-600" : "text-green-600"
                      }>
                        {row.porcentajeEjecucion}%
                      </span>
                    </td>
                  </tr>
                ))}
                {ejecucion.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-slate-400">
                      No hay apropiaciones cargadas para esta vigencia
                    </td>
                  </tr>
                )}
              </tbody>
              {ejecucion.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 font-bold bg-slate-50">
                    <td className="p-3" colSpan={5}>TOTALES</td>
                    <td className="p-3 text-right"><MontoDisplay valor={totales.apropiacion} /></td>
                    <td className="p-3 text-right"><MontoDisplay valor={totales.cdp} /></td>
                    <td className="p-3 text-right"><MontoDisplay valor={totales.compromisos} /></td>
                    <td className="p-3 text-right"><MontoDisplay valor={totales.pagos} /></td>
                    <td className="p-3 text-right"><MontoDisplay valor={totales.apropiacion - totales.cdp} /></td>
                    <td className="p-3 text-right">
                      {totales.apropiacion > 0 ? ((totales.compromisos / totales.apropiacion) * 100).toFixed(1) : "0"}%
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
