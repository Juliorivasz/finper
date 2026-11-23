import { Debt } from "../hooks/useDebts";
import { parseLocalDate } from "@/lib/utils";

export interface DebtSnapshotItem extends Debt {
  paidAtCutoff: number;
  pendingAtCutoff: number;
  isPaidAtCutoff: boolean;
}

export interface DebtSnapshot {
  totalOriginal: number;
  totalPaid: number;
  totalPending: number;
  paidPercentage: number;
  pendingPercentage: number;
  totalPagar: number;
  totalCobrar: number;
  items: DebtSnapshotItem[];
}

export interface TimeSeriesPoint {
  dateKey: string;
  formattedDate: string;
  rawDate: Date;
  totalDebt: number;
  totalPaid: number;
  totalPending: number;
}

/**
 * Normaliza una fecha al final del día (23:59:59.999) para comparaciones inclusivas.
 */
export function toEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Normaliza una fecha al inicio del día (00:00:00.000).
 */
export function toStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Calcula la foto consolidada acumulada de deudas a una fecha de corte específica.
 */
export function calculateDebtSnapshotAtDate(
  debts: Debt[],
  cutoffDate: Date,
  typeFilter: "all" | "payable" | "receivable" = "all",
  statusFilter: "all" | "pending" | "paid" = "all"
): DebtSnapshot {
  const cutoffEnd = toEndOfDay(cutoffDate);

  let totalOriginal = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let totalPagar = 0;
  let totalCobrar = 0;
  const items: DebtSnapshotItem[] = [];

  for (const debt of debts) {
    // 1. Filtrar por tipo si aplica
    if (typeFilter !== "all" && debt.type !== typeFilter) {
      continue;
    }

    // 2. Verificar que la deuda ya existía a la fecha de corte (por su fecha de origen/creación)
    const createdAt = parseLocalDate(debt.created_at);
    if (createdAt > cutoffEnd) {
      continue;
    }

    // 3. Sumar abonos realizados en o antes de la fecha de corte
    let paidAtCutoff = 0;
    if (debt.debt_payments && debt.debt_payments.length > 0) {
      for (const payment of debt.debt_payments) {
        const paymentDate = parseLocalDate(payment.date || payment.created_at);
        if (paymentDate <= cutoffEnd) {
          paidAtCutoff += Number(payment.amount) || 0;
        }
      }
    }

    // Evitar que el pago supere el monto original de la deuda
    paidAtCutoff = Math.min(debt.amount, Math.max(0, paidAtCutoff));
    const pendingAtCutoff = Math.max(0, debt.amount - paidAtCutoff);
    const isPaidAtCutoff = pendingAtCutoff === 0;

    // 4. Filtrar por estado a la fecha de corte
    if (statusFilter === "pending" && isPaidAtCutoff) {
      continue;
    }
    if (statusFilter === "paid" && !isPaidAtCutoff) {
      continue;
    }

    items.push({
      ...debt,
      paidAtCutoff,
      pendingAtCutoff,
      isPaidAtCutoff,
    });

    totalOriginal += debt.amount;
    totalPaid += paidAtCutoff;
    totalPending += pendingAtCutoff;

    if (debt.type === "payable") {
      totalPagar += pendingAtCutoff;
    } else if (debt.type === "receivable") {
      totalCobrar += pendingAtCutoff;
    }
  }

  const paidPercentage = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;
  const pendingPercentage = totalOriginal > 0 ? (totalPending / totalOriginal) * 100 : 0;

  return {
    totalOriginal,
    totalPaid,
    totalPending,
    paidPercentage: Math.round(paidPercentage * 10) / 10,
    pendingPercentage: Math.round(pendingPercentage * 10) / 10,
    totalPagar,
    totalCobrar,
    items,
  };
}

/**
 * Genera la serie de tiempo para el gráfico evolutivo en base al rango seleccionado.
 */
export function generateDebtTimeSeries(
  debts: Debt[],
  typeFilter: "all" | "payable" | "receivable" = "all",
  statusFilter: "all" | "pending" | "paid" = "all",
  range: "30d" | "90d" | "this_year" | "all" = "all"
): TimeSeriesPoint[] {
  if (!debts || debts.length === 0) return [];

  const now = new Date();
  let startDate = new Date();

  if (range === "30d") {
    startDate.setDate(now.getDate() - 30);
  } else if (range === "90d") {
    startDate.setDate(now.getDate() - 90);
  } else if (range === "this_year") {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else {
    // "all": buscar la fecha más antigua de deudas
    let earliest = now;
    for (const d of debts) {
      const cd = parseLocalDate(d.created_at);
      if (cd < earliest) earliest = cd;
    }
    startDate = new Date(earliest);
  }

  startDate = toStartOfDay(startDate);
  const endDate = toEndOfDay(now);

  // Recolectar fechas clave (creación de deudas y abonos) dentro del rango para granularidad natural
  const checkpointDates = new Set<string>();

  // Asegurar fecha de inicio y fecha final
  const toKey = (d: Date) => d.toISOString().split("T")[0];
  checkpointDates.add(toKey(startDate));
  checkpointDates.add(toKey(endDate));

  debts.forEach((d) => {
    const cd = parseLocalDate(d.created_at);
    if (cd >= startDate && cd <= endDate) {
      checkpointDates.add(toKey(cd));
    }
    d.debt_payments?.forEach((p) => {
      const pd = parseLocalDate(p.date || p.created_at);
      if (pd >= startDate && pd <= endDate) {
        checkpointDates.add(toKey(pd));
      }
    });
  });

  const sortedDateKeys = Array.from(checkpointDates).sort();

  return sortedDateKeys.map((key) => {
    const rawDate = parseLocalDate(key);
    const snapshot = calculateDebtSnapshotAtDate(debts, rawDate, typeFilter, statusFilter);

    const formattedDate = rawDate.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
    });

    return {
      dateKey: key,
      formattedDate,
      rawDate,
      totalDebt: snapshot.totalOriginal,
      totalPaid: snapshot.totalPaid,
      totalPending: snapshot.totalPending,
    };
  });
}
