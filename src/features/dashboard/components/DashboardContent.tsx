"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CreditCard, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExpenseForm } from "@/features/expenses/components/ExpenseForm";
import { useGetExpenses } from "@/features/expenses/hooks/useExpenses";
import { CategoryChart } from "./CategoryChart";
import { DebtChart } from "./DebtChart";
import { useGetDebts } from "@/features/debts/hooks/useDebts";
import { DebtForm } from "@/features/debts/components/DebtForm";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function DashboardContent() {
  const { data: expenses, isLoading: isExpensesLoading } = useGetExpenses();
  const { data: debts, isLoading: isDebtsLoading } = useGetDebts();
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);

  // Calcular KPIs de Gastos
  const { totalMes, ultimosMovimientos } = useMemo(() => {
    if (!expenses) return { totalMes: 0, ultimosMovimientos: [] };
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let total = 0;
    const movimientos = expenses.slice(0, 5); 

    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
        total += exp.amount;
      }
    });

    return { totalMes: total, ultimosMovimientos: movimientos };
  }, [expenses]);

  // Calcular KPIs de Deudas
  const { deudaTotal, deudaVencimientoTexto, entidadesConDeuda } = useMemo(() => {
    if (!debts) return { deudaTotal: 0, deudaVencimientoTexto: "Ninguno", entidadesConDeuda: 0 };

    const pendientes = debts.filter(d => d.type === "payable");
    let totalPendiente = 0;
    let nextDate: Date | null = null;
    let entidades = 0;

    pendientes.forEach(d => {
      const pagado = d.debt_payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const restante = d.amount - pagado;
      
      if (restante > 0) {
        totalPendiente += restante;
        entidades++;
        
        if (d.due_date) {
          const due = new Date(d.due_date);
          if (!nextDate || due < nextDate) {
            nextDate = due;
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
      entidadesConDeuda: entidades
    };
  }, [debts]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Resumen General</h1>
          <p className="text-muted-foreground mt-1">Aquí tienes un vistazo rápido a tus finanzas de este mes.</p>
        </div>
        <div className="flex gap-2">
          
          <Dialog open={isDebtModalOpen} onOpenChange={setIsDebtModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" /> Nueva Deuda
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar una Deuda</DialogTitle>
              </DialogHeader>
              <DebtForm onSuccessCallback={() => setIsDebtModalOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Nuevo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar un Gasto</DialogTitle>
              </DialogHeader>
              <ExpenseForm onSuccessCallback={() => setIsExpenseModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Tarjetas de Resumen (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gastos del Mes</CardTitle>
            <div className="p-2 bg-muted rounded-full">
              <Wallet className="w-4 h-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isExpensesLoading ? "..." : `$${totalMes.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">En el mes actual</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deuda Pendiente</CardTitle>
            <div className="p-2 bg-muted rounded-full">
              <CreditCard className="w-4 h-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isDebtsLoading ? "..." : `$${deudaTotal.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Repartido en {entidadesConDeuda} registro(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Próximo Vencimiento</CardTitle>
            <div className="p-2 bg-muted rounded-full">
              <AlertCircle className="w-4 h-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {isDebtsLoading ? "..." : deudaVencimientoTexto}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {entidadesConDeuda > 0 ? "Fecha límite más cercana" : "No hay pagos urgentes"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Gráficos y Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Gastos */}
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

        {/* Gráfico de Deudas */}
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
        
        {/* Lista de Últimos Movimientos */}
        <Card className="h-[350px] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Últimos Movimientos</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {isExpensesLoading ? (
              <p className="text-muted-foreground text-sm text-center mt-4">Cargando...</p>
            ) : ultimosMovimientos.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center mt-4">Aún no tienes gastos.</p>
            ) : (
              ultimosMovimientos.map((gasto) => (
                <div key={gasto.id} className="flex justify-between items-center p-3 bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {(gasto as any).categories?.name || "Gasto"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(gasto.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="font-bold text-foreground text-sm">
                    ${gasto.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
