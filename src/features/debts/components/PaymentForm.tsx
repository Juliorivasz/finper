"use client";

import { useForm, Controller } from "react-hook-form";
import { useCreateDebtPayment } from "../hooks/useDebts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedAmountInput } from "@/components/ui/animated-amount-input";
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
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<PaymentValues>();

  const onSubmit = (data: PaymentValues) => {
    if (data.amount <= 0 || data.amount > maxAmount) {
      toast.error(`El monto debe ser entre $0.01 y $${maxAmount.toFixed(2)}`);
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
      <div className="space-y-2">
        <label className="text-sm font-medium">Monto del abono</label>
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
        {errors.amount && <p className="text-red-500 text-sm">Ingresa un monto válido</p>}
        <p className="text-xs text-muted-foreground">Monto máximo: ${maxAmount.toFixed(2)}</p>
      </div>

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
