"use client";

import { createContext, useContext } from "react";

interface VigenciaContextType {
  vigenciaId: string;
  anio: number;
  estado: string;
  setVigencia: (vigenciaId: string, anio: number, estado: string) => void;
}

export const VigenciaContext = createContext<VigenciaContextType>({
  vigenciaId: "",
  anio: new Date().getFullYear(),
  estado: "ABIERTA",
  setVigencia: () => {},
});

export function useVigencia() {
  return useContext(VigenciaContext);
}
