"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useBalance } from "@/hooks/useBalance";
import { useGetExpenses } from "@/features/expenses/hooks/useExpenses";
import { useGetIncomes } from "@/features/incomes/hooks/useIncomes";
import { useGetDebts } from "@/features/debts/hooks/useDebts";
import { parseLocalDate } from "@/lib/utils";
import { CategoryChart } from "./CategoryChart";
import { DebtChart } from "./DebtChart";
import { OverdueAlertBanner } from "./OverdueAlertBanner";
import { DashboardHeroBalance } from "./DashboardHeroBalance";
import { DashboardMetricCards } from "./DashboardMetricCards";
import { DashboardRecentMovements } from "./DashboardRecentMovements";

export function DashboardContent() {
  const { data: incomes, isLoading: isIncomesLoading } = useGetIncomes();
  const { data: expenses, isLoading: isExpensesLoading } = useGetExpenses();
  const { data: debts, isLoading: isDebtsLoading } = useGetDebts();

  // Flujo de Caja
  const {
    totalSalidasMes,
    totalEntradasMes,
    balanceTotal,
    ultimosMovimientos,
    isLoading: isBalanceLoading,
  } = useBalance();

  // KPIs de Deudas
  const {
    deudaTotal,
    deudaVencimientoTexto,
    deudaVencimientoNombre,
    entidadesConDeuda,
    deudasVencidas,
  } = useMemo(() => {
    if (!debts) {
      return {
        deudaTotal: 0,
        deudaVencimientoTexto: "Ninguno",
        deudaVencimientoNombre: "",
        entidadesConDeuda: 0,
        deudasVencidas: [],
      };
    }

    const pendientes = debts.filter((d) => d.type === "payable");
    let totalPendiente = 0;
    let nextDate: Date | null = null;
    let nextDateNombre = "";
    let entidades = 0;
    const vencidas: any[] = [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    pendientes.forEach((d) => {
      const pagado = d.debt_payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const restante = d.amount - pagado;

      if (restante > 0) {
        totalPendiente += restante;
        entidades++;

        if (d.due_date) {
          const due = parseLocalDate(d.due_date);
          const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());

          if (dueDateOnly < today) {
            vencidas.push(d);
          } else {
            if (!nextDate || dueDateOnly < nextDate) {
              nextDate = dueDateOnly;
              nextDateNombre = d.description;
            }
          }
        }
      }
    });

    let textoVencimiento = "Estás al día";
    if (nextDate) {
      textoVencimiento = format(nextDate, "dd MMM yyyy", { locale: es });
    }

    return {
      deudaTotal: totalPendiente,
      deudaVencimientoTexto: textoVencimiento,
      deudaVencimientoNombre: nextDateNombre,
      entidadesConDeuda: entidades,
      deudasVencidas: vencidas,
    };
  }, [debts]);

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Resumen General</h1>
        <p className="text-sm text-muted-foreground">Aquí tienes un vistazo rápido a tus finanzas de este mes.</p>
      </div>

      {/* Alerta de Deudas Vencidas */}
      <OverdueAlertBanner deudasVencidas={deudasVencidas} />

      {/* Hero Saldo Disponible */}
      <DashboardHeroBalance balanceTotal={balanceTotal} isLoading={isBalanceLoading} />

      {/* Métricas Principales */}
      <DashboardMetricCards
        totalEntradasMes={totalEntradasMes}
        totalSalidasMes={totalSalidasMes}
        deudaTotal={deudaTotal}
        deudaVencimientoTexto={deudaVencimientoTexto}
        deudaVencimientoNombre={deudaVencimientoNombre}
        entidadesConDeuda={entidadesConDeuda}
        isLoadingIncomes={isIncomesLoading}
        isLoadingExpenses={isExpensesLoading}
        isLoadingDebts={isDebtsLoading}
      />

      {/* Gráficos y Últimos Movimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="h-[350px] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-0">
            {isExpensesLoading ? (
              <p className="text-muted-foreground text-sm">Cargando...</p>
            ) : (
              <CategoryChart expenses={expenses || []} />
            )}
          </CardContent>
        </Card>

        <Card className="h-[350px] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Balance de Deudas</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-0 pt-4">
            {isDebtsLoading ? (
              <p className="text-muted-foreground text-sm">Cargando...</p>
            ) : (
              <DebtChart debts={debts || []} />
            )}
          </CardContent>
        </Card>

        <DashboardRecentMovements
          movimientos={ultimosMovimientos}
          isLoading={isBalanceLoading}
        />
      </div>
    </div>
  );
}
