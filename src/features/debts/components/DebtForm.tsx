"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debtSchema, DebtFormValues } from "../schemas/debtSchema";
import { useCreateDebt } from "../hooks/useDebts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { AnimatedAmountInput } from "@/components/ui/animated-amount-input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DebtFormProps {
  onSuccessCallback?: () => void;
}

const DEBT_TYPE_OPTIONS = [
  { value: "payable", label: "Por Pagar" },
  { value: "receivable", label: "Por Cobrar" },
];

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
      <FormField label="Monto" error={errors.amount?.message} required>
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
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        {/* Fecha de vencimiento */}
        <FormField label="Límite" hint="Opcional" error={errors.due_date?.message}>
          <Input type="date" {...register("due_date")} />
        </FormField>

        {/* Tipo de deuda */}
        <FormField label="Tipo de Deuda" error={errors.type?.message} required>
          <Select
            options={DEBT_TYPE_OPTIONS}
            {...register("type")}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Descripción */}
        <FormField label="Descripción" error={errors.description?.message} required>
          <Input 
            placeholder="Ej: Préstamo a Juan..." 
            {...register("description")} 
          />
        </FormField>
        
        {/* Tasa por Mora */}
        <FormField label="Tasa Mora TNA" hint="% Opcional" error={errors.interest_rate?.message}>
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
        </FormField>
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
