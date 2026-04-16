"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Wallet,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  Receipt,
  ClipboardList,
  CreditCard,
  Building2,
  Scale,
  FileCheck2,
  ArrowRightLeft,
  BadgeDollarSign,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string; icon: React.ReactNode }[];
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: "Contabilidad",
    icon: <BookOpen className="h-4 w-4" />,
    children: [
      { label: "Plan de Cuentas", href: "/contabilidad/plan-cuentas", icon: <ClipboardList className="h-4 w-4" /> },
      { label: "Comprobantes", href: "/contabilidad/comprobantes", icon: <FileText className="h-4 w-4" /> },
      { label: "Libros Oficiales", href: "/contabilidad/libros", icon: <BookOpen className="h-4 w-4" /> },
    ],
  },
  {
    label: "Presupuesto",
    icon: <Wallet className="h-4 w-4" />,
    children: [
      { label: "Apropiaciones", href: "/presupuesto/apropiaciones", icon: <BadgeDollarSign className="h-4 w-4" /> },
      { label: "CDP", href: "/presupuesto/cdp", icon: <FileCheck2 className="h-4 w-4" /> },
      { label: "Registros Presupuestales", href: "/presupuesto/rp", icon: <Receipt className="h-4 w-4" /> },
      { label: "Ejecución", href: "/presupuesto/ejecucion", icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  {
    label: "Tesorería",
    icon: <CreditCard className="h-4 w-4" />,
    children: [
      { label: "Pagos", href: "/tesoreria/pagos", icon: <ArrowRightLeft className="h-4 w-4" /> },
      { label: "Recaudos", href: "/tesoreria/recaudos", icon: <BadgeDollarSign className="h-4 w-4" /> },
      { label: "Conciliación", href: "/tesoreria/conciliacion", icon: <Scale className="h-4 w-4" /> },
    ],
  },
  {
    label: "Terceros",
    href: "/terceros",
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: "Reportes",
    href: "/reportes",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    label: "Administración",
    icon: <Settings className="h-4 w-4" />,
    roles: ["ADMINISTRADOR"],
    children: [
      { label: "Usuarios", href: "/administracion/usuarios", icon: <Users className="h-4 w-4" /> },
      { label: "Vigencias", href: "/administracion/vigencias", icon: <Building2 className="h-4 w-4" /> },
      { label: "Parámetros", href: "/administracion/parametros", icon: <Settings className="h-4 w-4" /> },
      { label: "Auditoría", href: "/administracion/auditoria", icon: <ClipboardList className="h-4 w-4" /> },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Contabilidad: true,
    Presupuesto: true,
    Tesorería: true,
  });

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-lg font-bold text-white">SIIF</h1>
            <p className="text-xs text-slate-400">Sistema Financiero</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.children) {
            const isOpen = openMenus[item.label];
            const isActive = item.children.some((c) =>
              pathname.startsWith(c.href)
            );

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "hover:bg-slate-800 text-slate-300"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                          pathname === child.href ||
                            pathname.startsWith(child.href + "/")
                            ? "bg-blue-600 text-white"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                        )}
                      >
                        {child.icon}
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
