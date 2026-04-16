import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email as string },
          include: { entidad: true },
        });

        if (!usuario || !usuario.activo) return null;

        const passwordValido = await compare(
          credentials.password as string,
          usuario.passwordHash
        );

        if (!passwordValido) return null;

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          rol: usuario.rol,
          entidadId: usuario.entidad.id,
          entidadNombre: usuario.entidad.nombre,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = (user as any).rol;
        token.entidadId = (user as any).entidadId;
        token.entidadNombre = (user as any).entidadNombre;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).rol = token.rol;
        (session.user as any).entidadId = token.entidadId;
        (session.user as any).entidadNombre = token.entidadNombre;
      }
      return session;
    },
  },
});
