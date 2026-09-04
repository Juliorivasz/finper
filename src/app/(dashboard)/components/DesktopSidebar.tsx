"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Wallet, CreditCard, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // Clear cookies forcefully on the client as a fallback
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <aside className="w-64 bg-background border-r border-border hidden md:flex flex-col sticky top-0 h-screen">
      <div className="h-16 flex items-center px-6 border-b border-border gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2a2a2a] to-[#050505] flex items-center justify-center border border-gray-500/50 shadow-sm">
          <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-white">
            $
          </span>
        </div>
        <span className="text-xl font-extrabold tracking-tight">Finper.</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <Link 
          href="/dashboard" 
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            pathname === "/dashboard" 
              ? "bg-primary/10 text-primary font-medium" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <LayoutDashboard className="w-5 h-5" /> 
          Resumen
        </Link>
        <Link 
          href="/expenses" 
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            pathname === "/expenses" 
              ? "bg-primary/10 text-primary font-medium" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Wallet className="w-5 h-5" /> 
          Gastos
        </Link>
        <Link 
          href="/debts" 
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            pathname === "/debts" 
              ? "bg-primary/10 text-primary font-medium" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <CreditCard className="w-5 h-5" /> 
          Deudas
        </Link>
      </nav>

      <div className="p-4 border-t border-border space-y-4">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 rounded-md border border-border/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium truncate">{user.user_metadata?.full_name || "Usuario"}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-left text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-md transition-colors"
        >
          <LogOut className="w-5 h-5" /> 
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
