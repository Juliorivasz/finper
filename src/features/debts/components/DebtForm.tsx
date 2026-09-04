"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debtSchema, DebtFormValues } from "../schemas/debtSchema";
import { useCreateDebt } from "../hooks/useDebts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    reset,
    formState: { errors },
  } = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      type: "payable", // Yo debo por defecto
    },
  });

  const onSubmit = (data: DebtFormValues) => {
    createDebt(data, {
      onSuccess: () => {
        toast.success("Deuda registrada exitosamente");
        reset();
        onSuccessCallback?.();
      },
      onError: (error) => {
        toast.error(`Hubo un error: ${error.message}`);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo de deuda</label>
        <select
          {...register("type")}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="payable">Yo debo (Por Pagar)</option>
          <option value="receivable">Me deben (Por Cobrar)</option>
        </select>
        {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Descripción (Ej: Prestamo a Juan)</label>
        <Input placeholder="Descripción de la deuda" {...register("description")} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Monto</label>
        <Input 
          type="number" 
          step="0.01" 
          placeholder="0.00" 
          {...register("amount", { valueAsNumber: true })} 
        />
        {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Fecha límite de pago (Opcional)</label>
        <Input type="date" {...register("due_date")} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
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
