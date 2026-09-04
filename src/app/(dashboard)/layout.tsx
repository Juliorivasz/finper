import { MobileNav } from "./components/MobileNav";
import { DesktopSidebar } from "./components/DesktopSidebar";

// Todas las páginas del dashboard requieren autenticación dinámica (cookies de Supabase)
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-muted/20 pb-16 md:pb-0">
      <MobileNav />
      <DesktopSidebar />
      
      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col min-h-screen md:max-h-screen md:overflow-y-auto">
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
