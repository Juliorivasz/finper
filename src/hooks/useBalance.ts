import { useMemo } from "react";
import { useGetExpenses } from "@/features/expenses/hooks/useExpenses";
import { useGetIncomes } from "@/features/incomes/hooks/useIncomes";
import { useGetDebts } from "@/features/debts/hooks/useDebts";
import { parseLocalDate } from "@/lib/utils";

export function useBalance() {
  const { data: expenses, isLoading: isExpensesLoading } = useGetExpenses();
  const { data: incomes, isLoading: isIncomesLoading } = useGetIncomes();
  const { data: debts, isLoading: isDebtsLoading } = useGetDebts();

  return useMemo(() => {
    let gastosMes = 0;
    let ingresosMes = 0;
    let pagosEmitidosMes = 0;
    let pagosRecibidosMes = 0;
    
    
    const allMovimientos: any[] = [];
    if (expenses) {
      expenses.forEach(e => {
        allMovimientos.push({ ...e, movType: 'expense', movName: (e as any).categories?.name || 'Gasto' });
      });
    }
    if (incomes) {
      incomes.forEach(i => {
        allMovimientos.push({ ...i, movType: 'income', movName: 'Ingreso' });
      });
    }
    if (debts) {
      debts.forEach(d => {
        if (d.debt_payments) {
          d.debt_payments.forEach(p => {
             allMovimientos.push({ ...p, movType: d.type === 'payable' ? 'debt_pay' : 'debt_collect', movName: d.type === 'payable' ? 'Abono emitido' : 'Abono recibido', description: d.description });
          });
        }
      });
    }
    allMovimientos.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff === 0) {
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        return timeB - timeA;
      }
      return dateDiff;
    });
    const movimientos = allMovimientos.slice(0, 6);

    
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

    const totalEntradasMes = ingresosMes + pagosRecibidosMes;
    const totalSalidasMes = gastosMes + pagosEmitidosMes;
    
    let totalGastosHistorico = 0;
    let totalIngresosHistorico = 0;
    let totalPagosEmitidosHistorico = 0;
    let totalPagosRecibidosHistorico = 0;

    if (expenses) expenses.forEach(e => totalGastosHistorico += e.amount);
    if (incomes) incomes.forEach(i => totalIngresosHistorico += i.amount);
    if (debts) {
      debts.forEach(d => {
        if (d.debt_payments) {
          d.debt_payments.forEach(p => {
            if (d.type === "payable") {
              totalPagosEmitidosHistorico += p.amount;
            } else {
              totalPagosRecibidosHistorico += p.amount;
            }
          });
        }
      });
    }

    const totalEntradasHistorico = totalIngresosHistorico + totalPagosRecibidosHistorico;
    const totalSalidasHistorico = totalGastosHistorico + totalPagosEmitidosHistorico;
    const balanceTotal = totalEntradasHistorico - totalSalidasHistorico;

    return { 
      totalSalidasMes, 
      totalEntradasMes,
      balanceTotal,
      ultimosMovimientos: movimientos,
      allMovimientos,
      gastosMes,
      ingresosMes,
      isLoading: isExpensesLoading || isIncomesLoading || isDebtsLoading
    };
  }, [expenses, incomes, debts, isExpensesLoading, isIncomesLoading, isDebtsLoading]);
}
