"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateIncome } from "../hooks/useIncomes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedAmountInput } from "@/components/ui/animated-amount-input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a 0"),
  description: z.string().min(1, "La descripción es requerida"),
  category: z.string().min(1, "La categoría es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
});

type IncomeFormValues = z.infer<typeof formSchema>;

const DEFAULT_CATEGORIES = [
  "Sueldo",
  "Honorarios",
  "Ventas",
  "Rendimientos",
  "Transferencias",
  "Otros",
];

interface IncomeFormProps {
  onSuccessCallback?: () => void;
}

export function IncomeForm({ onSuccessCallback }: IncomeFormProps) {
  const { mutate: createIncome, isPending } = useCreateIncome();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "" as unknown as number,
      date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0],
      category: "",
      description: "",
    },
  });

  const onSubmit = (data: IncomeFormValues) => {
    createIncome(
      {
        ...data,
        amount: Number(data.amount),
        date: new Date(data.date).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("Ingreso registrado con éxito");
          reset();
          if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error) => {
          toast.error(`Error al registrar el ingreso: ${error.message}`);
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
        {/* Fecha */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Fecha</label>
          <Input type="date" {...register("date")} />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>

        {/* Categoría */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Categoría</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
            {...register("category")}
          >
            <option value="">Selecciona...</option>
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Descripción</label>
        <Input 
          placeholder="Ej: Sueldo mensual..." 
          {...register("description")} 
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar Ingreso"
        )}
      </Button>
    </form>
  );
}
