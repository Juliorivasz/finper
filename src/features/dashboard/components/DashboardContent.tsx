"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CreditCard, AlertCircle, Plus, Scale, ArrowDownToLine, AlertTriangle, ArrowUpRight, ArrowDownRight, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


import { useGetExpenses } from "@/features/expenses/hooks/useExpenses";
import { useGetIncomes } from "@/features/incomes/hooks/useIncomes";
import { CategoryChart } from "./CategoryChart";
import { DebtChart } from "./DebtChart";
import { useGetDebts } from "@/features/debts/hooks/useDebts";
import { formatCurrency, parseLocalDate, calculateOverdueInterest } from "@/lib/utils";
import { useBalance } from "@/hooks/useBalance";
import NumberFlow from "@number-flow/react";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function DashboardContent() {
  const { data: incomes, isLoading: isIncomesLoading } = useGetIncomes();
  const { data: expenses, isLoading: isExpensesLoading } = useGetExpenses();
  const { data: debts, isLoading: isDebtsLoading } = useGetDebts();
  
  const router = useRouter();
  
  
  
  
  

  // Calcular KPIs de Flujo de Caja
  const { totalSalidasMes, totalEntradasMes, balanceTotal, ultimosMovimientos, isLoading: isBalanceLoading } = useBalance();

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
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Resumen General</h1>
          <p className="text-sm text-muted-foreground">Aquí tienes un vistazo rápido a tus finanzas de este mes.</p>
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
            onClick={() => router.push('/deudas')}
          >
            Ir a pagarlas
          </Button>
        </div>
      )}

      
        {/* HERO BALANCE (DISEÑO TIPO BANCO) */}
        <div className="flex flex-col items-center justify-center bg-card p-8 rounded-2xl border border-border shadow-sm mb-2 relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-primary to-blue-500"></div>
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Saldo Disponible</span>
          <div className={`text-5xl md:text-6xl font-bold tracking-tight ${balanceTotal > 0 ? "text-emerald-500" : balanceTotal < 0 ? "text-red-500" : "text-foreground"}`}>
            {isBalanceLoading ? "..." : (
              <NumberFlow 
                value={balanceTotal} 
                locales="es-AR" 
                format={{ style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }} 
                animated={true}
              />
            )}
          </div>
        </div>

        <div className="flex lg:grid lg:grid-cols-4 gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-2 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] *:min-w-[85%] *:sm:min-w-[45%] *:lg:min-w-0 *:shrink-0 *:snap-start">
        
        

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
            <p className="text-xs text-sm text-muted-foreground">Ingresos + Cobros</p>
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
            <p className="text-xs text-sm text-muted-foreground">Gastos + Pagos</p>
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
            <p className="text-xs text-sm text-muted-foreground truncate" title={`Este mes: $${formatCurrency(deudaTotalEsteMes)} | Total en ${entidadesConDeuda} registro(s)`}>
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
            <p className="text-xs text-sm text-muted-foreground truncate">
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
            <Link href="/movimientos" className="text-xs text-primary hover:underline font-medium">
                Ver todos &rarr;
            </Link>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {isBalanceLoading ? (
                <p className="text-muted-foreground text-sm text-center mt-4">Cargando...</p>
              ) : ultimosMovimientos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground text-sm">No hay movimientos recientes</p>
                </div>
              ) : (
                ultimosMovimientos.map((mov: any) => (
                  <div key={mov.id} className="flex justify-between items-center p-3 bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg border border-border cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${mov.movType === 'income' || mov.movType === 'debt_collect' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {mov.movName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {parseLocalDate(mov.date).toLocaleDateString()}
                          {mov.description && <span className="ml-1 opacity-70">- {mov.description}</span>}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold whitespace-nowrap text-sm ${mov.movType === 'income' || mov.movType === 'debt_collect' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {mov.movType === 'income' || mov.movType === 'debt_collect' ? '+' : '-'}${formatCurrency(mov.amount)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
