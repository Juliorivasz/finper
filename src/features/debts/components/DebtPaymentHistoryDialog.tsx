"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, parseLocalDate } from "@/lib/utils";
import { ProcessedDebt } from "./DebtTable";
import { History, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface DebtPaymentHistoryDialogProps {
  debt: ProcessedDebt | null;
  onClose: () => void;
}

export function DebtPaymentHistoryDialog({
  debt,
  onClose,
}: DebtPaymentHistoryDialogProps) {
  if (!debt) return null;

  const payments = debt.debt_payments || [];
  const sortedMovements = [...payments].sort((a, b) => {
    return new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime();
  });

  return (
    <Dialog open={!!debt} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <History className="w-5 h-5 text-primary" />
            Historial de Movimientos
          </DialogTitle>
          <p className="text-xs text-muted-foreground truncate">{debt.description}</p>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Capital / Saldo Total</span>
              <span className="text-sm font-bold text-foreground">
                ${formatCurrency(debt.amount)}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">Total Abonado</span>
              <span className="text-sm font-bold text-emerald-500">
                ${formatCurrency(debt.paid || 0)}
              </span>
            </div>
          </div>

          {sortedMovements.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-6">
              No hay movimientos registrados para esta deuda.
            </p>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {sortedMovements.map((mov) => {
                const isCharge = mov.movement_type === "charge";
                const date = parseLocalDate(mov.date || mov.created_at);

                return (
                  <div
                    key={mov.id}
                    className="flex justify-between items-center bg-background p-3 rounded-md border border-border"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${
                          isCharge ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                        }`}
                      >
                        {isCharge ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">
                          {mov.description || (isCharge ? "Consumo de tarjeta" : "Abono")}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {date.toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={`text-sm font-bold ${
                          isCharge ? "text-red-500" : "text-emerald-500"
                        }`}
                      >
                        {isCharge ? "+" : "-"}${formatCurrency(mov.amount)}
                      </span>
                      {mov.installment_number && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1 mt-0.5">
                          Cuota {mov.installment_number}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
