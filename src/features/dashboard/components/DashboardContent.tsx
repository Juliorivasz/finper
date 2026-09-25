"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CreditCard, AlertCircle, Plus, Scale, ArrowDownToLine, AlertTriangle, ArrowUpRight, ArrowDownRight, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExpenseForm } from "@/features/expenses/components/ExpenseForm";
import { IncomeForm } from "@/features/incomes/components/IncomeForm";
import { useGetExpenses } from "@/features/expenses/hooks/useExpenses";
import { useGetIncomes } from "@/features/incomes/hooks/useIncomes";
import { CategoryChart } from "./CategoryChart";
import { DebtChart } from "./DebtChart";
import { useGetDebts } from "@/features/debts/hooks/useDebts";
import { formatCurrency, parseLocalDate } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { DebtForm } from "@/features/debts/components/DebtForm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function DashboardContent() {
  const { data: incomes, isLoading: isIncomesLoading } = useGetIncomes();
  const { data: expenses, isLoading: isExpensesLoading } = useGetExpenses();
  const { data: debts, isLoading: isDebtsLoading } = useGetDebts();
  
  const router = useRouter();
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Calcular KPIs de Flujo de Caja
  const { totalSalidasMes, totalEntradasMes, balanceMes, ultimosMovimientos } = useMemo(() => {
    let gastosMes = 0;
    let ingresosMes = 0;
    let pagosEmitidosMes = 0;
    let pagosRecibidosMes = 0;
    
    const movimientos = expenses ? expenses.slice(0, 5) : [];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (expenses) {
      expenses.forEach(exp => {
        const expDate = parseLocalDate(exp.date);
        if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
          gastosMes += exp.amount;
        }
      });
    }

    if (incomes) {
      incomes.forEach(inc => {
        const incDate = parseLocalDate(inc.date);
        if (incDate.getMonth() === currentMonth && incDate.getFullYear() === currentYear) {
          ingresosMes += inc.amount;
        }
      });
    }

    if (debts) {
      debts.forEach(d => {
        if (d.debt_payments) {
          d.debt_payments.forEach(p => {
            const pDate = parseLocalDate(p.date);
            if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
              if (d.type === 'payable') {
                pagosEmitidosMes += p.amount;
              } else {
                pagosRecibidosMes += p.amount;
              }
            }
          });
        }
      });
    }

    const totalEntradas = ingresosMes + pagosRecibidosMes;
    const totalSalidas = gastosMes + pagosEmitidosMes;
    const balance = totalEntradas - totalSalidas;

    return { 
      totalSalidasMes: totalSalidas, 
      totalEntradasMes: totalEntradas,
      balanceMes: balance,
      ultimosMovimientos: movimientos,
    };
  }, [expenses, incomes, debts]);

  // Calcular KPIs de Deudas
  const { deudaTotal, deudaTotalEsteMes, deudaVencimientoTexto, deudaVencimientoNombre, entidadesConDeuda, deudasVencidas } = useMemo(() => {
    if (!debts) return { deudaTotal: 0, deudaTotalEsteMes: 0, deudaVencimientoTexto: "Ninguno", deudaVencimientoNombre: "", entidadesConDeuda: 0, deudasVencidas: [] };

    const pendientes = debts.filter(d => d.type === "payable");
    let totalPendiente = 0;
    let totalEsteMes = 0;
    let nextDate: Date | null = null;
    let nextDateNombre = "";
    let entidades = 0;
    
    const vencidas: any[] = [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 
    
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    pendientes.forEach(d => {
      const pagado = d.debt_payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const restante = d.amount - pagado;
      
      if (restante > 0) {
        totalPendiente += restante;
        entidades++;
        
        if (d.due_date) {
          const due = parseLocalDate(d.due_date);
          const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
          
          if (dueDateOnly.getMonth() === currentMonth && dueDateOnly.getFullYear() === currentYear) {
            totalEsteMes += restante;
          }

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
      deudaTotalEsteMes: totalEsteMes,
      deudaVencimientoTexto: textoVencimiento,
      deudaVencimientoNombre: nextDateNombre,
      entidadesConDeuda: entidades,
      deudasVencidas: vencidas
    };
  }, [debts]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Resumen General</h1>
          <p className="text-muted-foreground mt-1">Aquí tienes un vistazo rápido a tus finanzas de este mes.</p>
        </div>
        
        <Dialog open={isDebtModalOpen} onOpenChange={setIsDebtModalOpen}>
          <DialogContent><DialogHeader><DialogTitle>Registrar una Deuda</DialogTitle></DialogHeader><DebtForm onSuccessCallback={() => setIsDebtModalOpen(false)} /></DialogContent>
        </Dialog>
        <Dialog open={isIncomeModalOpen} onOpenChange={setIsIncomeModalOpen}>
          <DialogContent><DialogHeader><DialogTitle>Registrar un Ingreso</DialogTitle></DialogHeader><IncomeForm onSuccessCallback={() => setIsIncomeModalOpen(false)} /></DialogContent>
        </Dialog>
        <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
          <DialogContent><DialogHeader><DialogTitle>Registrar un Gasto</DialogTitle></DialogHeader><ExpenseForm onSuccessCallback={() => setIsExpenseModalOpen(false)} /></DialogContent>
        </Dialog>

        {/* VISTA DESKTOP */}
        <div className="hidden sm:flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsDebtModalOpen(true)}>
            <Plus className="w-4 h-4" /> Nueva Deuda
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setIsIncomeModalOpen(true)}>
            <Plus className="w-4 h-4" /> Nuevo Ingreso
          </Button>
          <Button className="gap-2" onClick={() => setIsExpenseModalOpen(true)}>
            <Plus className="w-4 h-4" /> Nuevo Gasto
          </Button>
        </div>

        {/* VISTA MOBILE */}
        <div className="sm:hidden w-full mt-4">
          <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2 h-12 text-base shadow-sm" size="lg">
                <Plus className="w-5 h-5" /> Registrar Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-[400px] rounded-2xl">
              <DialogHeader>
                <DialogTitle>¿Qué deseas registrar?</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3 py-2">
                <Button variant="outline" className="h-16 text-base justify-start px-4 gap-4" onClick={() => { setIsMobileMenuOpen(false); setTimeout(() => setIsIncomeModalOpen(true), 200); }}>
                  <div className="p-2 bg-green-500/10 rounded-full text-green-500"><ArrowUpRight className="w-5 h-5" /></div>
                  Nuevo Ingreso
                </Button>
                <Button variant="outline" className="h-16 text-base justify-start px-4 gap-4" onClick={() => { setIsMobileMenuOpen(false); setTimeout(() => setIsExpenseModalOpen(true), 200); }}>
                  <div className="p-2 bg-red-500/10 rounded-full text-red-500"><ArrowDownRight className="w-5 h-5" /></div>
                  Nuevo Gasto
                </Button>
                <Button variant="outline" className="h-16 text-base justify-start px-4 gap-4" onClick={() => { setIsMobileMenuOpen(false); setTimeout(() => setIsDebtModalOpen(true), 200); }}>
                  <div className="p-2 bg-amber-500/10 rounded-full text-amber-500"><HandCoins className="w-5 h-5" /></div>
                  Nueva Deuda
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {deudasVencidas.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-red-500">
                ¡Tienes {deudasVencidas.length} deuda{deudasVencidas.length > 1 ? 's' : ''} vencida{deudasVencidas.length > 1 ? 's' : ''}!
              </h3>
              <p className="text-sm text-red-500/80 mt-1">
                {deudasVencidas.map((d: any) => d.description).join(', ')}
              </p>
            </div>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full sm:w-auto whitespace-nowrap"
            onClick={() => router.push('/debts')}
          >
            Ir a pagarlas
          </Button>
        </div>
      )}

      <div className="flex lg:grid lg:grid-cols-5 gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-2 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] *:min-w-[85%] *:sm:min-w-[45%] *:lg:min-w-0 *:shrink-0 *:snap-start">
        
        <Card className="bg-card shadow-sm border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance General</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-full">
              <Scale className="w-4 h-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex ${balanceMes > 0 ? "text-emerald-500" : balanceMes < 0 ? "text-red-500" : ""}`}>
              {isIncomesLoading || isExpensesLoading || isDebtsLoading ? "..." : (
                <NumberFlow 
                  value={Math.abs(balanceMes)} 
                  locales="es-AR" 
                  format={{ style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }} 
                  animated={true}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entradas del Mes</CardTitle>
            <div className="p-2 bg-muted rounded-full">
              <ArrowDownToLine className="w-4 h-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex">
              {isIncomesLoading || isDebtsLoading ? "..." : (
                <NumberFlow 
                  value={totalEntradasMes} 
                  locales="es-AR" 
                  format={{ style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }} 
                  animated={true}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ingresos + Cobros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Salidas del Mes</CardTitle>
            <div className="p-2 bg-muted rounded-full">
              <Wallet className="w-4 h-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex">
              {isExpensesLoading || isDebtsLoading ? "..." : (
                <NumberFlow 
                  value={totalSalidasMes} 
                  locales="es-AR" 
                  format={{ style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }} 
                  animated={true}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Gastos + Pagos</p>
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
            <div className="text-2xl font-bold flex">
              {isDebtsLoading ? "..." : (
                <NumberFlow 
                  value={deudaTotal} 
                  locales="es-AR" 
                  format={{ style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }} 
                  animated={true}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate" title={`Este mes: $${formatCurrency(deudaTotalEsteMes)} | Total en ${entidadesConDeuda} registro(s)`}>
              Este mes: ${formatCurrency(deudaTotalEsteMes)}
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
            <div className="text-2xl font-bold capitalize truncate" title={deudaVencimientoNombre || (deudasVencidas.length > 0 ? "Deudas Vencidas" : "Al día")}>
              {isDebtsLoading ? "..." : (deudaVencimientoNombre || (deudasVencidas.length > 0 ? "Deudas Vencidas" : "Al día"))}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {deudaVencimientoNombre 
                ? `Vence: ${deudaVencimientoTexto}` 
                : (deudasVencidas.length > 0 ? "Atiende tus pagos atrasados" : "No hay pagos urgentes")
              }
            </p>
          </CardContent>
        </Card>
      </div>

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
        
        <Card className="h-[350px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Últimos Movimientos</CardTitle>
            <Link href="/expenses" className="text-xs text-primary hover:underline font-medium">
              Ver todos &rarr;
            </Link>
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
                      {parseLocalDate(gasto.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="font-bold text-foreground text-sm">
                    ${formatCurrency(gasto.amount)}
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
