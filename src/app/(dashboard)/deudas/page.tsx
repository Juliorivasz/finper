import { DebtList } from "@/features/debts/components/DebtList";

export default function DebtsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Deudas</h1>
          <p className="text-muted-foreground mt-1">Lleva el control exacto de a quién le debes y quién te debe dinero.</p>
        </div>
      </div>
      
      <DebtList />
    </div>
  );
}
