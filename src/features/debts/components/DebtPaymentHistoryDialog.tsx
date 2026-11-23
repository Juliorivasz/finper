import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency, parseLocalDate } from "@/lib/utils"
import { ProcessedDebt } from "./DebtTable"

interface DebtPaymentHistoryDialogProps {
  debt: ProcessedDebt | null
  onClose: () => void
}

export function DebtPaymentHistoryDialog({
  debt,
  onClose,
}: DebtPaymentHistoryDialogProps) {
  return (
    <Dialog open={!!debt} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Historial de Abonos</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-4">
          <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border">
            <span className="text-sm font-medium">{debt?.description}</span>
            <span className="text-sm text-primary font-bold">
              Total Abonado: ${formatCurrency(debt?.paid || 0)}
            </span>
          </div>

          {!debt?.debt_payments || debt.debt_payments.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-6">
              No hay abonos registrados para esta deuda.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2">
              {debt.debt_payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex justify-between items-center bg-background p-3 rounded-md border border-border"
                >
                  <span className="text-sm text-muted-foreground">
                    {parseLocalDate(payment.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-bold text-foreground">
                    ${formatCurrency(payment.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
