"use client";

import { useSession } from "next-auth/react";
import { useVigencia } from "@/hooks/use-vigencia";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MontoDisplay } from "@/components/shared/monto-display";
import {
  BarChart3,
  FileCheck2,
  Receipt,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardData {
  ejecucion: any[];
  pendientes: {
    cdps: number;
    rps: number;
    comprobantes: number;
    pagos: number;
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { vigenciaId, anio } = useVigencia();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!vigenciaId) return;

    Promise.all([
      fetch(`/api/presupuesto/ejecucion?vigenciaId=${vigenciaId}`).then((r) =>
        r.json()
      ),
      fetch(
        `/api/presupuesto/cdp?vigenciaId=${vigenciaId}&estado=PENDIENTE_APROBACION&limit=1`
      ).then((r) => r.json()),
    ])
      .then(([ejecucion, cdpsPendientes]) => {
        setData({
          ejecucion: Array.isArray(ejecucion) ? ejecucion : [],
          pendientes: {
            cdps: cdpsPendientes.total || 0,
            rps: 0,
            comprobantes: 0,
            pagos: 0,
          },
        });
      })
      .catch(() => {});
  }, [vigenciaId]);

  const totalPresupuesto =
    data?.ejecucion?.reduce(
      (sum: number, e: any) => sum + (e.apropiacionDefinitiva || 0),
      0
    ) || 0;
  const totalCompromisos =
    data?.ejecucion?.reduce(
      (sum: number, e: any) => sum + (e.compromisos || 0),
      0
    ) || 0;
  const totalPagos =
    data?.ejecucion?.reduce(
      (sum: number, e: any) => sum + (e.pagos || 0),
      0
    ) || 0;
  const porcentajeEjecucion =
    totalPresupuesto > 0
      ? ((totalCompromisos / totalPresupuesto) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Bienvenido, {session?.user?.name}
        </h2>
        <p className="text-slate-500">
          Resumen ejecutivo - Vigencia {anio}
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Presupuesto Definitivo
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <MontoDisplay valor={totalPresupuesto} className="text-xl font-bold" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Compromisos (RP)
            </CardTitle>
            <Receipt className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <MontoDisplay valor={totalCompromisos} className="text-xl font-bold" />
            <p className="text-xs text-slate-500 mt-1">
              {porcentajeEjecucion}% del presupuesto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Pagos Realizados
            </CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <MontoDisplay valor={totalPagos} className="text-xl font-bold" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Pendientes de Aprobación
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {(data?.pendientes.cdps || 0) +
                (data?.pendientes.rps || 0) +
                (data?.pendientes.pagos || 0)}
            </p>
            <p className="text-xs text-slate-500 mt-1">documentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de ejecución resumida */}
      {data?.ejecucion && data.ejecucion.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ejecución Presupuestal de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left p-2">Rubro</th>
                    <th className="text-right p-2">Apropiación</th>
                    <th className="text-right p-2">CDP</th>
                    <th className="text-right p-2">Compromisos</th>
                    <th className="text-right p-2">Pagos</th>
                    <th className="text-right p-2">% Ejec.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ejecucion.slice(0, 10).map((row: any, i: number) => (
                    <tr key={i} className="border-b hover:bg-slate-50">
                      <td className="p-2">
                        <span className="font-mono text-xs text-slate-500">
                          {row.rubroCodigo}
                        </span>{" "}
                        {row.rubroNombre}
                      </td>
                      <td className="text-right p-2">
                        <MontoDisplay valor={row.apropiacionDefinitiva} />
                      </td>
                      <td className="text-right p-2">
                        <MontoDisplay valor={row.cdp} />
                      </td>
                      <td className="text-right p-2">
                        <MontoDisplay valor={row.compromisos} />
                      </td>
                      <td className="text-right p-2">
                        <MontoDisplay valor={row.pagos} />
                      </td>
                      <td className="text-right p-2">
                        <span
                          className={
                            row.porcentajeEjecucion > 90
                              ? "text-red-600 font-bold"
                              : row.porcentajeEjecucion > 70
                                ? "text-yellow-600"
                                : "text-green-600"
                          }
                        >
                          {row.porcentajeEjecucion}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info de acceso rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/presupuesto/cdp/nuevo"}>
          <CardContent className="pt-6 text-center">
            <FileCheck2 className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="font-medium">Nuevo CDP</p>
            <p className="text-xs text-slate-500">Certificado de disponibilidad</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/contabilidad/comprobantes/nuevo"}>
          <CardContent className="pt-6 text-center">
            <Receipt className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="font-medium">Nuevo Comprobante</p>
            <p className="text-xs text-slate-500">Comprobante contable</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/terceros/nuevo"}>
          <CardContent className="pt-6 text-center">
            <CreditCard className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="font-medium">Nuevo Tercero</p>
            <p className="text-xs text-slate-500">Registrar proveedor o contratista</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
