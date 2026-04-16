"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIPOS_DOCUMENTO } from "@/lib/constants";
import { Plus, Search } from "lucide-react";

export default function TercerosPage() {
  const [terceros, setTerceros] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const url = busqueda
      ? `/api/terceros?q=${encodeURIComponent(busqueda)}`
      : `/api/terceros?page=${page}&limit=20`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTerceros(data);
          setTotal(data.length);
        } else {
          setTerceros(data.data || []);
          setTotal(data.total || 0);
        }
      })
      .catch(() => {});
  }, [busqueda, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Terceros</h2>
          <p className="text-slate-500">
            Gestión de proveedores, contratistas y beneficiarios
          </p>
        </div>
        <Link href="/terceros/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Tercero
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por nombre o documento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left p-3">Documento</th>
                  <th className="text-left p-3">Nombre / Razón Social</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Ciudad</th>
                  <th className="text-left p-3">Régimen</th>
                  <th className="text-left p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {terceros.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-slate-50">
                    <td className="p-3">
                      <span className="text-xs text-slate-500">
                        {TIPOS_DOCUMENTO[t.tipoDocumento as keyof typeof TIPOS_DOCUMENTO]}
                      </span>
                      <br />
                      <span className="font-mono">
                        {t.numeroDocumento}
                        {t.digitoVerificacion && `-${t.digitoVerificacion}`}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{t.nombreCompleto}</td>
                    <td className="p-3">
                      <Badge variant="outline">
                        {t.tipoPersona === "NATURAL" ? "Natural" : "Jurídica"}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-500">{t.ciudad || "-"}</td>
                    <td className="p-3 text-xs text-slate-500">
                      {t.regimenTributario?.replace(/_/g, " ") || "-"}
                    </td>
                    <td className="p-3">
                      <Link href={`/terceros/${t.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver / Editar
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {terceros.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No se encontraron terceros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {total > 20 && !busqueda && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-slate-500 py-2">
            Página {page} de {Math.ceil(total / 20)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page * 20 >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
