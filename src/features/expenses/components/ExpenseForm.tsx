"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, ExpenseFormValues } from "../schemas/expenseSchema";
import { useCreateExpense, useGetCategories } from "../hooks/useExpenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import { AnimatedAmountInput } from "@/components/ui/animated-amount-input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExpenseFormProps {
  onSuccessCallback?: () => void;
}

export function ExpenseForm({ onSuccessCallback }: ExpenseFormProps) {
  const { mutate: createExpense, isPending } = useCreateExpense();
  const { data: categories, isLoading: isLoadingCategories } = useGetCategories();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: "" as unknown as number,
      date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0],
      category_id: "",
      description: "",
      is_recurring: false,
    },
  });

  const onSubmit = (data: ExpenseFormValues) => {
    createExpense(
      {
        ...data,
        amount: Number(data.amount),
        date: new Date(data.date).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("Gasto registrado con éxito");
          reset();
          if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error) => {
          toast.error(`Error al registrar el gasto: ${error.message}`);
        },
      }
    );
  };

  const categoryOptions = categories?.map((cat) => ({
    value: cat.id,
    label: cat.name,
  })) || [];

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
        {/* Fecha */}
        <FormField label="Fecha" error={errors.date?.message} required>
          <Input type="date" {...register("date")} />
        </FormField>

        {/* Categoría */}
        <FormField label="Categoría" error={errors.category_id?.message} required>
          <Select
            options={categoryOptions}
            placeholder="Selecciona..."
            disabled={isLoadingCategories}
            {...register("category_id")}
          />
        </FormField>
      </div>

      {/* Descripción */}
      <FormField label="Descripción" hint="Opcional" error={errors.description?.message}>
        <Input
          type="text"
          placeholder="Ej: Cena con amigos..."
          {...register("description")}
        />
      </FormField>

      {/* Gasto Recurrente */}
      <div className="flex items-center gap-2 pt-1">
        <Checkbox id="is_recurring" {...register("is_recurring")} />
        <Label htmlFor="is_recurring" className="cursor-pointer font-normal">
          Es un gasto recurrente mensual
        </Label>
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar Gasto"
        )}
      </Button>
    </form>
  );
}
