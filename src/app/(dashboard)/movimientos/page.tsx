import { MovimientosList } from "@/features/dashboard/components/MovimientosList";

export default function MovimientosPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Estado de Cuenta</h1>
          <p className="text-sm text-muted-foreground">Historial completo de todas tus transacciones ordenado por fecha.</p>
        </div>
      </div>
      
      <MovimientosList />
    </div>
  );
}
