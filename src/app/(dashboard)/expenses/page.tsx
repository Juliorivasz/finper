import { ExpenseList } from "@/features/expenses/components/ExpenseList";

export default function ExpensesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Control de Gastos</h1>
          <p className="text-muted-foreground mt-1">Busca, filtra y administra todos tus movimientos financieros.</p>
        </div>
      </div>
      
      <ExpenseList />
    </div>
  );
}
