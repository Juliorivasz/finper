"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentForm } from "./PaymentForm";

export interface DebtToPayInfo {
  id: string;
  pendingAmount: number;
  installmentAmount?: number;
  currentInstallment?: number;
  totalInstallments?: number;
  allowsCapitalAmortization?: boolean;
}

interface DebtPaymentDialogProps {
  debtToPay: DebtToPayInfo | null;
  onClose: () => void;
}

export function DebtPaymentDialog({
  debtToPay,
  onClose,
}: DebtPaymentDialogProps) {
  return (
    <Dialog open={!!debtToPay} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Abonar a la deuda</DialogTitle>
        </DialogHeader>
        {debtToPay && (
          <PaymentForm
            debtId={debtToPay.id}
            maxAmount={debtToPay.pendingAmount}
            installmentAmount={debtToPay.installmentAmount}
            currentInstallment={debtToPay.currentInstallment}
            totalInstallments={debtToPay.totalInstallments}
            allowsCapitalAmortization={debtToPay.allowsCapitalAmortization}
            onSuccessCallback={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
