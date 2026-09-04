"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, ExpenseFormValues } from "../schemas/expenseSchema";
import { useCreateExpense, useGetCategories } from "../hooks/useExpenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExpenseFormProps {
  onSuccessCallback?: () => void;
}

export function ExpenseForm({ onSuccessCallback }: ExpenseFormProps) {
  const { data: categories, isLoading: isLoadingCategories } = useGetCategories();
  const { mutate: createExpense, isPending } = useCreateExpense();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: "" as unknown as number,
      date: new Date().toISOString().split("T")[0],
      category_id: "",
      description: "",
      is_recurring: false,
    },
  });

  const onSubmit = (data: ExpenseFormValues) => {
    createExpense(data, {
      onSuccess: () => {
        toast.success("Gasto registrado exitosamente");
        reset();
        onSuccessCallback?.();
      },
      onError: (error) => {
        toast.error(`Hubo un error: ${error.message}`);
      }
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Registrar Gasto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Monto */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Monto</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                {...register("amount", { valueAsNumber: true })}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Fecha */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Fecha</label>
            <Input type="date" {...register("date")} />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Categoría</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
              {...register("category_id")}
              disabled={isLoadingCategories}
            >
              <option value="">Selecciona una categoría</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-sm text-red-500">{errors.category_id.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Descripción (Opcional)</label>
            <Input
              type="text"
              placeholder="Ej: Cena con amigos..."
              {...register("description")}
            />
          </div>

          {/* Gasto Recurrente */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="is_recurring"
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              {...register("is_recurring")}
            />
            <label
              htmlFor="is_recurring"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              Es un gasto recurrente (mensual)
            </label>
          </div>

          {/* Botón Guardar */}
          <Button type="submit" className="w-full mt-4" disabled={isPending}>
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
      </CardContent>
    </Card>
  );
}
