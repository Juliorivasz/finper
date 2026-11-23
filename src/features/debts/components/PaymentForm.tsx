"use client";

import { useForm, Controller } from "react-hook-form";
import { useCreateDebtPayment } from "../hooks/useDebts";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { AnimatedAmountInput } from "@/components/ui/animated-amount-input";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Coins } from "lucide-react";
import { toast } from "sonner";

interface PaymentFormProps {
  debtId: string;
  maxAmount: number;
  installmentAmount?: number;
  currentInstallment?: number;
  totalInstallments?: number;
  allowsCapitalAmortization?: boolean;
  onSuccessCallback?: () => void;
}

interface PaymentValues {
  amount: number;
  description?: string;
  installment_number?: number;
}

export function PaymentForm({
  debtId,
  maxAmount,
  installmentAmount,
  currentInstallment,
  totalInstallments,
  allowsCapitalAmortization,
  onSuccessCallback,
}: PaymentFormProps) {
  const { mutate: addPayment, isPending } = useCreateDebtPayment();
  const { control, handleSubmit, register, setValue, reset, formState: { errors } } = useForm<PaymentValues>({
    defaultValues: {
      amount: "" as unknown as number,
      installment_number: currentInstallment || undefined,
    },
  });

  const onSubmit = (data: PaymentValues) => {
    if (data.amount <= 0 || data.amount > maxAmount) {
      toast.error(`El monto debe ser entre $0.01 y ${formatCurrency(maxAmount)}`);
      return;
    }

    addPayment(
      {
        debt_id: debtId,
        amount: data.amount,
        installment_number: data.installment_number || null,
        description: data.description || (data.installment_number ? `Pago Cuota ${data.installment_number}` : "Abono"),
      },
      {
        onSuccess: () => {
          toast.success("Abono registrado exitosamente");
          reset();
          onSuccessCallback?.();
        },
        onError: (err) => {
          toast.error(`Error al registrar abono: ${err.message}`);
        },
      }
    );
  };

  const handlePayInstallmentPreset = () => {
    if (installmentAmount) {
      const amountToPay = Math.min(maxAmount, installmentAmount);
      setValue("amount", amountToPay);
      if (currentInstallment) {
        setValue("installment_number", currentInstallment);
        setValue("description", `Pago Cuota ${currentInstallment}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Botón rápido de pagar cuota si tiene plan de cuotas */}
      {installmentAmount && totalInstallments && totalInstallments > 1 && (
        <div className="p-3 bg-muted/20 border border-border rounded-lg flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">
              Cuota {currentInstallment || 1} de {totalInstallments}
            </span>
            <span className="text-xs text-muted-foreground">
              ${formatCurrency(installmentAmount)}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePayInstallmentPreset}
            className="text-xs gap-1 cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5 text-primary" />
            Cargar valor de cuota
          </Button>
        </div>
      )}

      <FormField
        label="Monto del abono"
        hint={`Máx: ${formatCurrency(maxAmount)}`}
        error={errors.amount ? "Ingresa un monto válido" : undefined}
        required
      >
        <Controller
          name="amount"
          control={control}
          rules={{ required: true, min: 0.01, max: maxAmount }}
          render={({ field }) => (
            <AnimatedAmountInput value={field.value} onChange={field.onChange} autoFocus />
          )}
        />
      </FormField>

      <FormField label="Detalle o nota (Opcional)">
        <Input placeholder="Ej: Abono quincenal, amortización capital..." {...register("description")} />
      </FormField>

      <Button type="submit" className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold rounded-xl shadow-md shadow-primary/20 hover:shadow-primary/30 mt-3 cursor-pointer" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registrando abono...
          </>
        ) : (
          "Guardar Abono"
        )}
      </Button>
    </form>
  );
}
