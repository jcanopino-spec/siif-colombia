"use client";

import { SessionProvider } from "next-auth/react";
import { VigenciaContext } from "@/hooks/use-vigencia";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [vigencia, setVigenciaState] = useState({
    vigenciaId: "",
    anio: new Date().getFullYear(),
    estado: "ABIERTA",
  });

  const setVigencia = (vigenciaId: string, anio: number, estado: string) => {
    setVigenciaState({ vigenciaId, anio, estado });
    if (typeof window !== "undefined") {
      localStorage.setItem("vigencia", JSON.stringify({ vigenciaId, anio, estado }));
    }
  };

  // Cargar vigencia activa al iniciar
  useEffect(() => {
    const stored = localStorage.getItem("vigencia");
    if (stored) {
      const parsed = JSON.parse(stored);
      setVigenciaState(parsed);
    } else {
      // Obtener vigencia activa del servidor
      fetch("/api/admin/vigencias?estado=ABIERTA")
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.length > 0) {
            const v = data.data[0];
            setVigencia(v.id, v.anio, v.estado);
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <SessionProvider>
      <VigenciaContext.Provider value={{ ...vigencia, setVigencia }}>
        {children}
        <Toaster position="top-right" richColors />
      </VigenciaContext.Provider>
    </SessionProvider>
  );
}
