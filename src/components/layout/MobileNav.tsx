"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  LogOut, 
  User as UserIcon, 
  ArrowDownToLine, 
  Menu 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function MobileNav() {
  const pathname = usePathname();
  const { user, isLoggingOut, logout } = useAuth();
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-6 h-14 bg-background border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2a2a2a] to-[#050505] flex items-center justify-center border border-gray-500/50 shadow-sm">
            <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-white">
              $
            </span>
          </div>
          <span className="font-extrabold tracking-tight text-foreground">
            Finper<span className="text-primary">.</span>
          </span>
        </div>

        {user ? (
          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 cursor-pointer"
                aria-label="Perfil de usuario"
              >
                <UserIcon className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2 z-[60]">
              <div className="flex flex-col space-y-1 p-2 border-b border-border mb-2">
                <p className="text-sm font-medium text-foreground">{user.user_metadata?.full_name || "Usuario"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <button
                onClick={logout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-2 py-2 w-full text-left text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoggingOut ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>{isLoggingOut ? "Cerrando..." : "Cerrar sesión"}</span>
              </button>
            </PopoverContent>
          </Popover>
        ) : (
          <button
            onClick={logout}
            disabled={isLoggingOut}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="Cerrar sesión"
          >
            {isLoggingOut ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogOut className="w-5 h-5" />
            )}
          </button>
        )}
      </header>

      {/* Mobile Bottom Navigation (4 Core Buttons) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around items-center h-16 z-40 px-2 pb-safe">
        <Link
          href="/resumen"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative",
            pathname === "/resumen" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {pathname === "/resumen" && <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full" />}
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Resumen</span>
        </Link>

        <Link
          href="/ingresos"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative",
            pathname === "/ingresos" ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {pathname === "/ingresos" && <div className="absolute top-0 w-8 h-1 bg-emerald-500 rounded-b-full" />}
          <ArrowDownToLine className="w-5 h-5" />
          <span className="text-[10px] font-medium">Ingresos</span>
        </Link>

        <Link
          href="/gastos"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative",
            pathname === "/gastos" ? "text-red-500" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {pathname === "/gastos" && <div className="absolute top-0 w-8 h-1 bg-red-500 rounded-b-full" />}
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-medium">Gastos</span>
        </Link>

        <button
          onClick={() => setShowDrawer(true)}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative cursor-pointer",
            showDrawer ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {showDrawer && <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full" />}
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">Más</span>
        </button>
      </nav>

      {/* Drawer para 'Más' */}
      {showDrawer && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            onClick={() => setShowDrawer(false)} 
          />
          <div className="relative bg-card border-t border-border w-full rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300 pb-12">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-6 text-center text-foreground">Explorar más</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/deudas"
                onClick={() => setShowDrawer(false)}
                className="flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 p-6 rounded-2xl border border-border gap-4 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <CreditCard className="w-7 h-7" />
                </div>
                <span className="font-semibold text-foreground">Deudas</span>
              </Link>
              <Link
                href="/movimientos"
                onClick={() => setShowDrawer(false)}
                className="flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 p-6 rounded-2xl border border-border gap-4 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Wallet className="w-7 h-7" />
                </div>
                <span className="font-semibold text-foreground">Movimientos</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
