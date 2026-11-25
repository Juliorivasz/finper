"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  LogOut, 
  User as UserIcon, 
  ArrowDownToLine, 
  ArrowLeftRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";

const NAV_ITEMS = [
  { href: "/resumen", label: "Resumen", icon: LayoutDashboard },
  { href: "/ingresos", label: "Ingresos", icon: ArrowDownToLine },
  { href: "/gastos", label: "Gastos", icon: Wallet },
  { href: "/deudas", label: "Deudas", icon: CreditCard },
  { href: "/movimientos", label: "Movimientos", icon: ArrowLeftRight },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { user, isLoggingOut, logout } = useAuth();

  return (
    <aside className="w-64 bg-background border-r border-border hidden md:flex flex-col sticky top-0 h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2a2a2a] to-[#050505] flex items-center justify-center border border-gray-500/50 shadow-sm">
          <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-white">
            $
          </span>
        </div>
        <span className="text-xl font-extrabold tracking-tight text-foreground">
          Finper<span className="text-primary">.</span>
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User & Session Footer */}
      <div className="p-4 border-t border-border mt-auto">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {user.user_metadata?.full_name || "Usuario"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user.email}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 w-full transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>{isLoggingOut ? "Cerrando..." : "Cerrar sesión"}</span>
        </button>
      </div>
    </aside>
  );
}
