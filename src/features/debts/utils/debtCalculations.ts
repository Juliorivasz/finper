import { Debt, DebtPayment } from "../types";

export interface InstallmentMetrics {
  installmentAmount: number;
  remainingInstallments: number;
  currentInstallment: number;
  progressPercent: number;
}

/**
 * Calcula las métricas de un plan de cuotas.
 */
export function calculateInstallmentMetrics(
  amount: number,
  installmentsTotal: number = 1,
  installmentsPaid: number = 0
): InstallmentMetrics {
  const safeTotal = Math.max(1, installmentsTotal);
  const safePaid = Math.min(safeTotal, Math.max(0, installmentsPaid));
  const installmentAmount = amount / safeTotal;
  const remainingInstallments = safeTotal - safePaid;
  const currentInstallment = Math.min(safeTotal, safePaid + 1);
  const progressPercent = Math.round((safePaid / safeTotal) * 100);

  return {
    installmentAmount,
    remainingInstallments,
    currentInstallment,
    progressPercent,
  };
}

/**
 * Calcula el ahorro estimado de intereses al adelantar capital (amortización).
 */
export function calculatePrepaymentSavings(
  capitalToPrepay: number,
  tnaPercentage: number = 0,
  monthsRemaining: number = 1
): number {
  if (capitalToPrepay <= 0 || tnaPercentage <= 0 || monthsRemaining <= 0) {
    return 0;
  }
  const annualRate = tnaPercentage / 100;
  const monthlyRate = annualRate / 12;
  // Ahorro aproximado de interés no devengado por los meses restantes
  return capitalToPrepay * monthlyRate * monthsRemaining;
}

/**
 * Obtiene el balance activo neto considerando cargos (aumentos) y abonos (pagos).
 */
export function calculateDebtNetBalance(debt: Debt): {
  totalCharges: number;
  totalPayments: number;
  netPending: number;
} {
  let totalPayments = 0;
  let totalCharges = 0;

  if (debt.debt_payments && debt.debt_payments.length > 0) {
    for (const mov of debt.debt_payments) {
      const amount = Number(mov.amount) || 0;
      if (mov.movement_type === "charge") {
        totalCharges += amount;
      } else {
        totalPayments += amount;
      }
    }
  }

  // Si no hay movimientos de cargo explícitos, el capital base es debt.amount
  const totalDebtCapital = Math.max(debt.amount, totalCharges);
  const netPending = Math.max(0, totalDebtCapital - totalPayments);

  return {
    totalCharges,
    totalPayments,
    netPending,
  };
}

/**
 * Genera el título descriptivo para una tarjeta de crédito o compromiso.
 */
export function getCardDisplayTitle(debt: Debt): string {
  if (debt.modality === "credit_card") {
    const parts: string[] = [];
    if (debt.card_brand) parts.push(`[${debt.card_brand}]`);
    if (debt.card_bank) parts.push(debt.card_bank);
    if (debt.card_alias && debt.card_alias !== debt.card_bank) parts.push(`- ${debt.card_alias}`);
    if (debt.card_last_digits) parts.push(`(•••• ${debt.card_last_digits})`);
    if (parts.length > 0) return parts.join(" ");
  }
  return debt.description;
}
