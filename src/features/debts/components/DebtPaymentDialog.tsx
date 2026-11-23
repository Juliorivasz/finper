import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PaymentForm } from "./PaymentForm"

interface DebtPaymentDialogProps {
  debtToPay: { id: string; pendingAmount: number } | null
  onClose: () => void
}

export function DebtPaymentDialog({
  debtToPay,
  onClose,
}: DebtPaymentDialogProps) {
  return (
    <Dialog open={!!debtToPay} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abonar a la deuda</DialogTitle>
        </DialogHeader>
        {debtToPay && (
          <PaymentForm
            debtId={debtToPay.id}
            maxAmount={debtToPay.pendingAmount}
            onSuccessCallback={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
