import { IncomeList } from "@/features/incomes/components/IncomeList";

export const metadata = {
  title: "Ingresos | Finper",
  description: "Gestiona tus ingresos y fuentes de dinero.",
};

export default function IncomesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Ingresos</h1>
        <p className="text-muted-foreground mt-1">
          Lleva el control de todas tus fuentes de dinero.
        </p>
      </div>

      <IncomeList />
    </div>
  );
}
