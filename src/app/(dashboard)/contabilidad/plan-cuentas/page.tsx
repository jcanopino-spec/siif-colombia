"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, ChevronDown } from "lucide-react";

export default function PlanCuentasPage() {
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set(["1", "2", "3", "4", "5"]));

  useEffect(() => {
    const url = busqueda
      ? `/api/contabilidad/plan-cuentas?q=${encodeURIComponent(busqueda)}`
      : "/api/contabilidad/plan-cuentas";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setCuentas(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [busqueda]);

  const toggleExpand = (codigo: string) => {
    setExpandidas((prev) => {
      const next = new Set(prev);
      if (next.has(codigo)) next.delete(codigo);
      else next.add(codigo);
      return next;
    });
  };

  const tieneHijos = (codigo: string) =>
    cuentas.some((c) => c.codigoPadre === codigo);

  const cuentasVisibles = busqueda
    ? cuentas
    : cuentas.filter((c) => {
        if (c.nivel <= 1) return true;
        // Mostrar si algún ancestro está expandido
        let padre = c.codigoPadre;
        while (padre) {
          if (!expandidas.has(padre)) return false;
          const cuentaPadre = cuentas.find((p) => p.codigo === padre);
          padre = cuentaPadre?.codigoPadre;
        }
        return true;
      });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Plan de Cuentas</h2>
        <p className="text-slate-500">Plan Único de Cuentas - Contaduría General de la Nación (CGN)</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por código o nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left p-3">Código</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Naturaleza</th>
                <th className="text-left p-3">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {cuentasVisibles.map((c) => (
                <tr
                  key={c.codigo}
                  className={`border-b hover:bg-slate-50 ${c.tipo === "TITULO" ? "font-medium" : ""}`}
                >
                  <td className="p-3">
                    <div className="flex items-center" style={{ paddingLeft: `${(c.nivel - 1) * 16}px` }}>
                      {tieneHijos(c.codigo) ? (
                        <button onClick={() => toggleExpand(c.codigo)} className="mr-1">
                          {expandidas.has(c.codigo) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <span className="w-5" />
                      )}
                      <span className="font-mono">{c.codigo}</span>
                    </div>
                  </td>
                  <td className="p-3">{c.nombre}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={c.naturaleza === "DEBITO" ? "text-blue-600" : "text-red-600"}>
                      {c.naturaleza === "DEBITO" ? "Db" : "Cr"}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-slate-500">
                    {c.tipo === "TITULO" ? "Título" : "Movimiento"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
