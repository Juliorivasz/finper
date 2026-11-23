"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAddDebtCharge } from "../hooks/useDebts";
import { Debt } from "../types";
import { getCardDisplayTitle } from "../utils/debtCalculations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { AnimatedAmountInput } from "@/components/ui/animated-amount-input";
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface DebtAddChargeDialogProps {
  debt: Debt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const addChargeSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a 0"),
  description: z.string().min(1, "El concepto o comercio es obligatorio"),
});

type FormValues = z.infer<typeof addChargeSchema>;

export function DebtAddChargeDialog({ debt, open, onOpenChange }: DebtAddChargeDialogProps) {
  const { mutate: addCharge, isPending } = useAddDebtCharge();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(addChargeSchema),
    defaultValues: {
      amount: "" as unknown as number,
      description: "",
    },
  });

  if (!debt) return null;

  const isCard = debt.modality === "credit_card";
  const title = isCard ? "Agregar Consumo con Tarjeta" : "Sumar Deuda / Ampliar Capital";

  const onSubmit = (data: FormValues) => {
    addCharge(
      {
        debt_id: debt.id,
        amount: Number(data.amount),
        description: data.description,
        currentDebtAmount: Number(debt.amount),
      },
      {
        onSuccess: () => {
          toast.success(isCard ? "Consumo registrado en la tarjeta" : "Capital ampliado con éxito");
          reset();
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(`Error al registrar: ${err.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <PlusCircle className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <p className="text-xs text-muted-foreground truncate">
            {getCardDisplayTitle(debt)}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <FormField label="Monto a sumar" error={errors.amount?.message} required>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <AnimatedAmountInput value={field.value} onChange={field.onChange} autoFocus />
              )}
            />
          </FormField>

          <FormField
            label={isCard ? "Comercio / Detalle de la compra" : "Motivo de la ampliación"}
            error={errors.description?.message}
            required
          >
            <Input
              placeholder={isCard ? "Ej: Supermercado, Combustible..." : "Ej: Préstamo adicional para arreglo..."}
              {...register("description")}
            />
          </FormField>

          <div className="flex gap-2.5 pt-2">
            <Button type="button" variant="outline" className="w-1/2 h-11 rounded-xl cursor-pointer" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="w-1/2 h-11 font-semibold rounded-xl shadow-md shadow-primary/20 hover:shadow-primary/30 cursor-pointer" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : "Sumar al Saldo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
