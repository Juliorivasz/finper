"use client";

import { History, HandCoins, Trash2, PlusCircle, CreditCard, Banknote, Building2, User } from "lucide-react";
import { formatDistanceStrict } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, parseLocalDate } from "@/lib/utils";
import { ProcessedDebt } from "./DebtTable";
import { getCardDisplayTitle, calculateInstallmentMetrics } from "../utils/debtCalculations";

interface DebtMobileListProps {
  debts: ProcessedDebt[];
  today: Date;
  onViewHistory: (debt: ProcessedDebt) => void;
  onPayDebt: (debt: ProcessedDebt) => void;
  onAddCharge: (debt: ProcessedDebt) => void;
  onDeleteDebt: (id: string) => void;
}

export function DebtMobileList({
  debts,
  today,
  onViewHistory,
  onPayDebt,
  onAddCharge,
  onDeleteDebt,
}: DebtMobileListProps) {
  return (
    <div className="md:hidden divide-y divide-border">
      {debts.map((debt) => {
        const isOverdue =
          debt.pending > 0 && debt.due_date && parseLocalDate(debt.due_date) < today;

        const displayTitle = getCardDisplayTitle(debt);
        const installmentInfo = debt.installments_total && debt.installments_total > 1
          ? calculateInstallmentMetrics(debt.amount, debt.installments_total, debt.installments_paid || 0)
          : null;

        return (
          <div key={debt.id} className="p-4 space-y-3 bg-card">
            {/* Header: Título, Modalidad y Monto */}
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-base text-foreground truncate">
                    {displayTitle}
                  </span>
                  {debt.modality === "credit_card" && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-primary/40 text-primary">
                      Tarjeta
                    </Badge>
                  )}
                  {debt.modality === "personal_loan" && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-emerald-500/40 text-emerald-500">
                      Préstamo
                    </Badge>
                  )}
                  {debt.modality === "bank_loan" && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-blue-500/40 text-blue-500">
                      Bancario
                    </Badge>
                  )}
                </div>

                <div className="text-xs flex flex-wrap gap-x-1.5 items-center mt-1 leading-tight">
                  <span className="text-muted-foreground">
                    {debt.type === "payable" ? "Yo debo" : "Me deben"} •
                  </span>
                  <span className={isOverdue ? "text-red-500 font-bold" : "text-muted-foreground"}>
                    {isOverdue
                      ? `Venció hace ${formatDistanceStrict(parseLocalDate(debt.due_date!), today, { locale: es })}`
                      : `Vence: ${debt.due_date ? parseLocalDate(debt.due_date).toLocaleDateString(undefined) : "S/F"}`}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="font-bold text-primary whitespace-nowrap text-right text-lg leading-none">
                  ${formatCurrency(Math.max(0, debt.pending))}
                </span>
                {debt.interestAmount > 0 && (
                  <span className="text-[11px] text-red-500 font-medium mt-1">
                    +${formatCurrency(debt.interestAmount)} mora
                  </span>
                )}
                <span className="text-xs text-muted-foreground mt-1">
                  de ${formatCurrency(debt.amount)}
                </span>
              </div>
            </div>

            {/* Footer: Estado, Cuotas y Botones de acción táctiles */}
            <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                {debt.pending <= 0 ? (
                  <Badge variant="success">Saldada</Badge>
                ) : (
                  <Badge variant="warning">Pendiente</Badge>
                )}
                {installmentInfo && (
                  <span className="text-xs text-muted-foreground font-medium">
                    Cuota {installmentInfo.currentInstallment}/{debt.installments_total}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Botón Sumar consumo */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2 text-primary border-primary/30 cursor-pointer"
                  onClick={() => onAddCharge(debt)}
                  title="Sumar consumo o deuda"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  <span className="text-xs">Sumar</span>
                </Button>

                {/* Botón Abonar */}
                {debt.pending > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    className="h-9 px-2.5 cursor-pointer text-xs"
                    onClick={() => onPayDebt(debt)}
                  >
                    <HandCoins className="h-4 w-4 mr-1" /> Abonar
                  </Button>
                )}

                {/* Historial */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => onViewHistory(debt)}
                >
                  <History className="h-4 w-4" />
                </Button>

                {/* Eliminar */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-2 text-muted-foreground hover:text-red-500 cursor-pointer"
                  onClick={() => onDeleteDebt(debt.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
