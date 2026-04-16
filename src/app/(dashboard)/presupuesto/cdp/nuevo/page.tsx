"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVigencia } from "@/hooks/use-vigencia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MontoDisplay } from "@/components/shared/monto-display";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface ItemCDP {
  rubroId: string;
  rubroCodigo: string;
  rubroNombre: string;
  valor: number;
}

export default function NuevoCDPPage() {
  const router = useRouter();
  const { vigenciaId } = useVigencia();
  const [loading, setLoading] = useState(false);
  const [rubros, setRubros] = useState<any[]>([]);

  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [objeto, setObjeto] = useState("");
  const [solicitante, setSolicitante] = useState("");
  const [dependencia, setDependencia] = useState("");
  const [items, setItems] = useState<ItemCDP[]>([
    { rubroId: "", rubroCodigo: "", rubroNombre: "", valor: 0 },
  ]);

  useEffect(() => {
    fetch("/api/presupuesto/rubros?tipo=GASTO&esTitulo=false")
      .then((r) => r.json())
      .then((data) => setRubros(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const total = items.reduce((s, i) => s + (i.valor || 0), 0);

  const agregarItem = () => {
    setItems((prev) => [...prev, { rubroId: "", rubroCodigo: "", rubroNombre: "", valor: 0 }]);
  };

  const eliminarItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const actualizarItem = (index: number, field: string, value: any) => {
    setItems((prev) => {
      const nuevo = [...prev];
      (nuevo[index] as any)[field] = value;
      if (field === "rubroId") {
        const rubro = rubros.find((r) => r.id === value);
        if (rubro) {
          nuevo[index].rubroCodigo = rubro.codigo;
          nuevo[index].rubroNombre = rubro.nombre;
        }
      }
      return nuevo;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/presupuesto/cdp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: new Date(fecha),
          objeto, solicitante, dependencia, vigenciaId,
          items: items.map((i) => ({ rubroId: i.rubroId, valor: i.valor })),
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }
      toast.success("CDP creado exitosamente");
      router.push("/presupuesto/cdp");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/presupuesto/cdp">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Volver</Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Nuevo CDP</h2>
          <p className="text-slate-500">Certificado de Disponibilidad Presupuestal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Información del CDP</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha *</Label>
                <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Dependencia Solicitante *</Label>
                <Input value={dependencia} onChange={(e) => setDependencia(e.target.value)} required placeholder="Ej: Secretaría de Hacienda" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Solicitante *</Label>
              <Input value={solicitante} onChange={(e) => setSolicitante(e.target.value)} required placeholder="Nombre del funcionario solicitante" />
            </div>
            <div className="space-y-2">
              <Label>Objeto del Gasto *</Label>
              <Textarea value={objeto} onChange={(e) => setObjeto(e.target.value)} required placeholder="Descripción detallada del objeto del gasto..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Rubros Presupuestales</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={agregarItem}>
              <Plus className="h-4 w-4 mr-1" /> Agregar rubro
            </Button>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left p-2">Rubro</th>
                  <th className="text-right p-2 w-44">Valor</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">
                      <Select value={item.rubroId} onValueChange={(v) => actualizarItem(i, "rubroId", v)}>
                        <SelectTrigger className="text-xs"><SelectValue placeholder="Seleccionar rubro..." /></SelectTrigger>
                        <SelectContent>
                          {rubros.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.codigo} - {r.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Input type="number" step="0.01" min="0" value={item.valor || ""} onChange={(e) => actualizarItem(i, "valor", parseFloat(e.target.value) || 0)} className="text-right font-mono" />
                    </td>
                    <td className="p-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => eliminarItem(i)} disabled={items.length <= 1}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="p-2">TOTAL</td>
                  <td className="p-2 text-right"><MontoDisplay valor={total} /></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Link href="/presupuesto/cdp"><Button variant="outline">Cancelar</Button></Link>
          <Button type="submit" disabled={loading || total <= 0}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" /> Guardar CDP
          </Button>
        </div>
      </form>
    </div>
  );
}
