import { Income } from "../types";
import { parseLocalDate } from "@/lib/utils";

export interface IncomeAverageMetrics {
  total: number;
  count: number;
  averagePerTransaction: number;
  monthlyAverage: number;
  monthsCount: number;
}

/**
 * Calcula métricas de promedio mensual (salario promedio) y promedio por transacción
 * para un conjunto de ingresos dentro de un rango de fechas.
 */
export function calculateIncomeAverages(
  incomes: Income[],
  dateRange?: { from?: Date; to?: Date }
): IncomeAverageMetrics {
  if (!incomes || incomes.length === 0) {
    return {
      total: 0,
      count: 0,
      averagePerTransaction: 0,
      monthlyAverage: 0,
      monthsCount: 1,
    };
  }

  const total = incomes.reduce((acc, inc) => acc + (Number(inc.amount) || 0), 0);
  const count = incomes.length;
  const averagePerTransaction = count > 0 ? total / count : 0;

  // Cálculo de la cantidad de meses que abarca el rango
  let monthsCount = 1;

  if (dateRange?.from && dateRange?.to) {
    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);
    
    // Diferencia en días
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // Si coincide con meses de calendario completos (ej: día 1 al último día del mes)
    const startDay = from.getDate();
    const isFullMonths = startDay === 1;

    if (isFullMonths && diffDays >= 28) {
      const yearDiff = to.getFullYear() - from.getFullYear();
      const monthDiff = to.getMonth() - from.getMonth();
      const calculatedMonths = yearDiff * 12 + monthDiff + 1;
      monthsCount = Math.max(1, calculatedMonths);
    } else {
      // Proporción basada en el promedio de días por mes (30.44 días)
      const calculatedMonths = Number((diffDays / 30.4375).toFixed(1));
      monthsCount = Math.max(1, calculatedMonths);
    }
  } else if (incomes.length > 1) {
    // Si no hay rango explícito ("todo el tiempo"), calcular el span entre el primer y último ingreso
    const timestamps = incomes.map((i) => parseLocalDate(i.date).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const diffDays = Math.max(1, Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24)) + 1);
    const calculatedMonths = Number((diffDays / 30.4375).toFixed(1));
    monthsCount = Math.max(1, calculatedMonths);
  }

  const monthlyAverage = monthsCount > 0 ? total / monthsCount : total;

  return {
    total,
    count,
    averagePerTransaction,
    monthlyAverage,
    monthsCount,
  };
}
