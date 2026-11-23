"use client";

import { useForm, Controller } from "react-hook-form";
import { useCreateDebtPayment } from "../hooks/useDebts";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { AnimatedAmountInput } from "@/components/ui/animated-amount-input";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentFormProps {
  debtId: string;
  maxAmount: number;
  onSuccessCallback?: () => void;
}

interface PaymentValues {
  amount: number;
}

export function PaymentForm({ debtId, maxAmount, onSuccessCallback }: PaymentFormProps) {
  const { mutate: addPayment, isPending } = useCreateDebtPayment();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<PaymentValues>();

  const onSubmit = (data: PaymentValues) => {
    if (data.amount <= 0 || data.amount > maxAmount) {
      toast.error(`El monto debe ser entre $0.01 y ${formatCurrency(maxAmount)}`);
      return;
    }
    
    addPayment({ debt_id: debtId, amount: data.amount }, {
      onSuccess: () => {
        toast.success("Abono registrado exitosamente");
        reset();
        onSuccessCallback?.();
      },
      onError: (err) => {
        toast.error(`Error al registrar abono: ${err.message}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <AnimatedAmountInput 
              value={field.value} 
              onChange={field.onChange} 
              autoFocus 
            />
          )}
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registrando...
          </>
        ) : (
          "Guardar Abono"
        )}
      </Button>
    </form>
  );
}
