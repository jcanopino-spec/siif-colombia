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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MontoDisplay } from "@/components/shared/monto-display";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface Movimiento {
  cuentaId: string;
  cuentaCodigo: string;
  cuentaNombre: string;
  terceroId: string;
  descripcion: string;
  debito: number;
  credito: number;
}

export default function NuevoComprobantePage() {
  const router = useRouter();
  const { vigenciaId } = useVigencia();
  const [loading, setLoading] = useState(false);
  const [cuentas, setCuentas] = useState<any[]>([]);

  const [tipo, setTipo] = useState("GENERAL");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [concepto, setConcepto] = useState("");
  const [movimientos, setMovimientos] = useState<Movimiento[]>([
    { cuentaId: "", cuentaCodigo: "", cuentaNombre: "", terceroId: "", descripcion: "", debito: 0, credito: 0 },
    { cuentaId: "", cuentaCodigo: "", cuentaNombre: "", terceroId: "", descripcion: "", debito: 0, credito: 0 },
  ]);

  useEffect(() => {
    fetch("/api/contabilidad/plan-cuentas?tipo=MOVIMIENTO")
      .then((r) => r.json())
      .then((data) => setCuentas(Array.isArray(data) ? data : data.data || []))
      .catch(() => {});
  }, []);

  const totalDebitos = movimientos.reduce((s, m) => s + (m.debito || 0), 0);
  const totalCreditos = movimientos.reduce((s, m) => s + (m.credito || 0), 0);
  const diferencia = Math.abs(totalDebitos - totalCreditos);
  const cuadrado = diferencia < 0.01;

  const agregarMovimiento = () => {
    setMovimientos((prev) => [
      ...prev,
      { cuentaId: "", cuentaCodigo: "", cuentaNombre: "", terceroId: "", descripcion: "", debito: 0, credito: 0 },
    ]);
  };

  const eliminarMovimiento = (index: number) => {
    if (movimientos.length <= 2) return;
    setMovimientos((prev) => prev.filter((_, i) => i !== index));
  };

  const actualizarMovimiento = (index: number, field: string, value: any) => {
    setMovimientos((prev) => {
      const nuevo = [...prev];
      (nuevo[index] as any)[field] = value;

      if (field === "cuentaId") {
        const cuenta = cuentas.find((c) => c.id === value);
        if (cuenta) {
          nuevo[index].cuentaCodigo = cuenta.codigo;
          nuevo[index].cuentaNombre = cuenta.nombre;
        }
      }
      return nuevo;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuadrado) {
      toast.error("Los débitos deben ser iguales a los créditos");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/contabilidad/comprobantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          fecha: new Date(fecha),
          concepto,
          vigenciaId,
          movimientos: movimientos.map((m) => ({
            cuentaId: m.cuentaId,
            terceroId: m.terceroId || null,
            descripcion: m.descripcion || null,
            debito: m.debito || 0,
            credito: m.credito || 0,
          })),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success("Comprobante creado exitosamente");
      router.push("/contabilidad/comprobantes");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/contabilidad/comprobantes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Nuevo Comprobante Contable</h2>
          <p className="text-slate-500">Registrar movimientos contables con partida doble</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Encabezado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Comprobante</Label>
                <Select value={tipo} onValueChange={(v) => v && setTipo(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INGRESO">Ingreso</SelectItem>
                    <SelectItem value="EGRESO">Egreso</SelectItem>
                    <SelectItem value="GENERAL">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>No. (automático)</Label>
                <Input value="Se asignará al guardar" disabled />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label>Concepto / Glosa *</Label>
              <Textarea
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                required
                placeholder="Descripción del comprobante contable..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Movimientos</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={agregarMovimiento}>
              <Plus className="h-4 w-4 mr-1" /> Agregar línea
            </Button>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left p-2 w-80">Cuenta</th>
                  <th className="text-left p-2">Descripción</th>
                  <th className="text-right p-2 w-36">Débito</th>
                  <th className="text-right p-2 w-36">Crédito</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">
                      <Select
                        value={mov.cuentaId}
                        onValueChange={(v) => actualizarMovimiento(i, "cuentaId", v)}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Seleccionar cuenta..." />
                        </SelectTrigger>
                        <SelectContent>
                          {cuentas.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.codigo} - {c.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Input
                        value={mov.descripcion}
                        onChange={(e) => actualizarMovimiento(i, "descripcion", e.target.value)}
                        placeholder="Detalle..."
                        className="text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={mov.debito || ""}
                        onChange={(e) => actualizarMovimiento(i, "debito", parseFloat(e.target.value) || 0)}
                        className="text-right font-mono"
                        disabled={mov.credito > 0}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={mov.credito || ""}
                        onChange={(e) => actualizarMovimiento(i, "credito", parseFloat(e.target.value) || 0)}
                        className="text-right font-mono"
                        disabled={mov.debito > 0}
                      />
                    </td>
                    <td className="p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarMovimiento(i)}
                        disabled={movimientos.length <= 2}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="p-2" colSpan={2}>TOTALES</td>
                  <td className="p-2 text-right">
                    <MontoDisplay valor={totalDebitos} />
                  </td>
                  <td className="p-2 text-right">
                    <MontoDisplay valor={totalCreditos} />
                  </td>
                  <td></td>
                </tr>
                {!cuadrado && (
                  <tr>
                    <td colSpan={5} className="p-2 text-center text-red-600 text-sm font-medium">
                      Diferencia: <MontoDisplay valor={diferencia} className="text-red-600" /> — Los débitos deben ser iguales a los créditos
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Link href="/contabilidad/comprobantes">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={loading || !cuadrado}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
        </div>
      </form>
    </div>
  );
}
