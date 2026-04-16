"use client";

import { useSession, signOut } from "next-auth/react";
import { useVigencia } from "@/hooks/use-vigencia";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Calendar } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const { anio, estado } = useVigencia();

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const rolLabels: Record<string, string> = {
    ADMINISTRADOR: "Administrador",
    JEFE_AREA: "Jefe de Área",
    AUXILIAR: "Auxiliar",
  };

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium">Vigencia {anio}</span>
          <Badge
            variant={estado === "ABIERTA" ? "default" : "secondary"}
            className="text-xs"
          >
            {estado === "ABIERTA" ? "Abierta" : estado === "CERRADA" ? "Cerrada" : "En cierre"}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-slate-500">
                  {rolLabels[(session.user as any).rol] || (session.user as any).rol}
                </p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Mi perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
