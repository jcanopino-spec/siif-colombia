import { RolUsuario } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    rol: RolUsuario;
    entidadId: string;
    entidadNombre: string;
  }

  interface Session {
    user: User & {
      email: string;
      name: string;
      rol: RolUsuario;
      entidadId: string;
      entidadNombre: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: RolUsuario;
    entidadId: string;
    entidadNombre: string;
  }
}
