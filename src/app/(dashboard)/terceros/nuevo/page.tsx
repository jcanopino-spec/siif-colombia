"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NuevoTerceroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tipoPersona, setTipoPersona] = useState("NATURAL");
  const [form, setForm] = useState({
    tipoDocumento: "CC",
    numeroDocumento: "",
    digitoVerificacion: "",
    razonSocial: "",
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    direccion: "",
    ciudad: "",
    departamento: "",
    telefono: "",
    email: "",
    responsableIva: false,
    granContribuyente: false,
    regimenTributario: "",
    actividadEconomica: "",
  });

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/terceros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tipoPersona,
          regimenTributario: form.regimenTributario || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al crear tercero");
      }

      toast.success("Tercero creado exitosamente");
      router.push("/terceros");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/terceros">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Nuevo Tercero</h2>
          <p className="text-slate-500">Registrar proveedor, contratista o beneficiario</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Persona</Label>
                <Select value={tipoPersona} onValueChange={(v) => v && setTipoPersona(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NATURAL">Persona Natural</SelectItem>
                    <SelectItem value="JURIDICA">Persona Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Select
                  value={form.tipoDocumento}
                  onValueChange={(v) => v && handleChange("tipoDocumento", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="NIT">NIT</SelectItem>
                    <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                    <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Número de Documento *</Label>
                <Input
                  value={form.numeroDocumento}
                  onChange={(e) => handleChange("numeroDocumento", e.target.value)}
                  required
                  placeholder="Ej: 900123456"
                />
              </div>
              {form.tipoDocumento === "NIT" && (
                <div className="space-y-2">
                  <Label>DV</Label>
                  <Input
                    value={form.digitoVerificacion}
                    onChange={(e) => handleChange("digitoVerificacion", e.target.value)}
                    placeholder="0"
                    maxLength={1}
                  />
                </div>
              )}
            </div>

            {tipoPersona === "JURIDICA" ? (
              <div className="space-y-2">
                <Label>Razón Social *</Label>
                <Input
                  value={form.razonSocial}
                  onChange={(e) => handleChange("razonSocial", e.target.value)}
                  required
                  placeholder="Nombre de la empresa"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primer Nombre *</Label>
                  <Input
                    value={form.primerNombre}
                    onChange={(e) => handleChange("primerNombre", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Segundo Nombre</Label>
                  <Input
                    value={form.segundoNombre}
                    onChange={(e) => handleChange("segundoNombre", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primer Apellido *</Label>
                  <Input
                    value={form.primerApellido}
                    onChange={(e) => handleChange("primerApellido", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Segundo Apellido</Label>
                  <Input
                    value={form.segundoApellido}
                    onChange={(e) => handleChange("segundoApellido", e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input
                  value={form.direccion}
                  onChange={(e) => handleChange("direccion", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input
                  value={form.ciudad}
                  onChange={(e) => handleChange("ciudad", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Input
                  value={form.departamento}
                  onChange={(e) => handleChange("departamento", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={form.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Información Tributaria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Régimen Tributario</Label>
                <Select
                  value={form.regimenTributario}
                  onValueChange={(v) => v && handleChange("regimenTributario", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESPONSABLE_IVA">Responsable de IVA</SelectItem>
                    <SelectItem value="NO_RESPONSABLE_IVA">No Responsable de IVA</SelectItem>
                    <SelectItem value="GRAN_CONTRIBUYENTE">Gran Contribuyente</SelectItem>
                    <SelectItem value="REGIMEN_SIMPLE">Régimen Simple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Actividad Económica (CIIU)</Label>
                <Input
                  value={form.actividadEconomica}
                  onChange={(e) => handleChange("actividadEconomica", e.target.value)}
                  placeholder="Ej: 4111"
                />
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={form.responsableIva}
                  onCheckedChange={(v) => handleChange("responsableIva", !!v)}
                />
                <Label className="font-normal">Responsable de IVA</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={form.granContribuyente}
                  onCheckedChange={(v) => handleChange("granContribuyente", !!v)}
                />
                <Label className="font-normal">Gran Contribuyente</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Link href="/terceros">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Guardar Tercero
          </Button>
        </div>
      </form>
    </div>
  );
}
