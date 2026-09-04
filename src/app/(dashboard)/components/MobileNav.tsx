"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Wallet, CreditCard, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      toast.loading("Cerrando sesión...", { id: "logout" });
      
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // Clear cookies forcefully on the client as a fallback
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      toast.success("Sesión cerrada", { id: "logout" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error al cerrar sesión", { id: "logout" });
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-6 h-14 bg-background border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2a2a2a] to-[#050505] flex items-center justify-center border border-gray-500/50 shadow-sm">
            <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-white">
              $
            </span>
          </div>
          <span className="font-extrabold tracking-tight">Finper.</span>
        </div>
        
        {user ? (
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <UserIcon className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2">
              <div className="flex flex-col space-y-1 p-2 border-b border-border mb-2">
                <p className="text-sm font-medium">{user.user_metadata?.full_name || "Usuario"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-2 py-2 w-full text-left text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" /> 
                )}
                {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
              </button>
            </PopoverContent>
          </Popover>
        ) : (
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogOut className="w-5 h-5" />
            )}
          </button>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around items-center h-16 z-50 px-2 pb-safe">
        <Link 
          href="/dashboard" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
            pathname === "/dashboard" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Resumen</span>
        </Link>
        <Link 
          href="/expenses" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
            pathname === "/expenses" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-medium">Gastos</span>
        </Link>
        <Link 
          href="/debts" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
            pathname === "/debts" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Deudas</span>
        </Link>
      </nav>
    </>
  );
}
