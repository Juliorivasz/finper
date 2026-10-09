"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debtSchema, DebtFormValues } from "../schemas/debtSchema";
import { useCreateDebt } from "../hooks/useDebts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedAmountInput } from "@/components/ui/animated-amount-input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DebtFormProps {
  onSuccessCallback?: () => void;
}

export function DebtForm({ onSuccessCallback }: DebtFormProps) {
  const { mutate: createDebt, isPending } = useCreateDebt();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      amount: "" as unknown as number,
      type: "payable",
      description: "",
      due_date: "",
      interest_rate: "" as unknown as number,
    },
  });

  const onSubmit = (data: DebtFormValues) => {
    createDebt(
      {
        ...data,
        amount: Number(data.amount),
        due_date: data.due_date ? new Date(data.due_date).toISOString() : undefined,
        interest_rate: data.interest_rate ? Number(data.interest_rate) : null,
      },
      {
        onSuccess: () => {
          toast.success("Deuda registrada con éxito");
          reset();
          if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error) => {
          toast.error(`Error al registrar la deuda: ${error.message}`);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Monto */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Monto</label>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <AnimatedAmountInput 
              value={field.value} 
              onChange={field.onChange} 
              autoFocus 
            />
          )}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Fecha de vencimiento */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Límite (Opcional)</label>
          <Input type="date" {...register("due_date")} />
          {errors.due_date && (
            <p className="text-sm text-red-500">{errors.due_date.message}</p>
          )}
        </div>

        {/* Tipo de deuda */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Tipo de Deuda</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
            {...register("type")}
          >
            <option value="payable">Por Pagar</option>
            <option value="receivable">Por Cobrar</option>
          </select>
          {errors.type && (
            <p className="text-sm text-red-500">{errors.type.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Descripción */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Descripción</label>
          <Input 
            placeholder="Ej: Préstamo a Juan..." 
            {...register("description")} 
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>
        
        {/* Tasa por Mora */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Tasa Mora TNA % (Opcional)</label>
          <div className="relative">
            <Input 
              type="number"
              step="0.01"
              placeholder="Ej: 36.5" 
              className="pr-8"
              {...register("interest_rate", { valueAsNumber: true })} 
            />
            <span className="absolute right-3 top-2.5 text-sm text-muted-foreground pointer-events-none">%</span>
          </div>
          {errors.interest_rate && (
            <p className="text-sm text-red-500">{errors.interest_rate.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar Deuda"
        )}
      </Button>
    </form>
  );
}
