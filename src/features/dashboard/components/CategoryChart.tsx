"use client";

import { Expense } from "@/features/expenses/types";
import { parseLocalDate } from "@/lib/utils";
import { DonutChart } from "@/components/ui/DonutChart";

export function CategoryChart({ expenses }: { expenses: Expense[] }) {
  if (!expenses || expenses.length === 0) {
    return <DonutChart data={[]} totalValue={0} emptyMessage="Sin datos para graficar este mes" />;
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filtrar solo los de este mes
  const expensesThisMonth = expenses.filter(e => {
    const d = parseLocalDate(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalThisMonth = expensesThisMonth.reduce((sum, e) => sum + e.amount, 0);

  if (expensesThisMonth.length === 0) {
    return <DonutChart data={[]} totalValue={0} emptyMessage="Sin gastos este mes" />;
  }

  // Agrupar gastos por categoria
  const grouped = expensesThisMonth.reduce((acc, expense) => {
    const name = (expense as any).categories?.name || "Categoría general";
    acc[name] = (acc[name] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(grouped).map(([name, value]) => ({ name, value }));

  return <DonutChart data={data} totalValue={totalThisMonth} centerText="Total Mes" />;
}
