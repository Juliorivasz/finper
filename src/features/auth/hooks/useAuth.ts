"use client";

import { useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Obtener sesión inicial
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Escuchar cambios de autenticación en tiempo real
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      toast.loading("Cerrando sesión...", { id: "auth-logout" });

      const supabase = createClient();
      await supabase.auth.signOut();

      // Limpieza preventiva de cookies en cliente
      if (typeof document !== "undefined") {
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }

      toast.success("Sesión cerrada correctamente", { id: "auth-logout" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Ocurrió un error al cerrar sesión", { id: "auth-logout" });
      setIsLoggingOut(false);
    }
  }, [router]);

  return {
    user,
    isLoading,
    isLoggingOut,
    logout,
  };
}
