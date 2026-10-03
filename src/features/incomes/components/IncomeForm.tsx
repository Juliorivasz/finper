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
  amount: z.number({ message: "Ingresa un número válido" }).positive("El monto debe ser mayor a 0"),
  description: z.string().min(2, "La descripción es muy corta"),
  category: z.string().min(1, "Selecciona una categoría"),
  date: z.string().min(1, "La fecha es requerida"),
});

type IncomeFormValues = z.infer<typeof formSchema>;

const DEFAULT_CATEGORIES = [
  "Sueldo",
  "Negocio",
  "Inversiones",
  "Regalos",
  "Freelance",
  "Ventas",
  "Otros",
];

interface IncomeFormProps {
  onSuccessCallback?: () => void;
}

export function IncomeForm({ onSuccessCallback }: IncomeFormProps) {
  const { mutate: createIncome, isPending } = useCreateIncome();
  
  const {
    register, control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "" as unknown as number,
      description: "",
      category: "Sueldo",
      date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0],
    },
  });

  const onSubmit = (data: IncomeFormValues) => {
    // Asegurarnos de guardar la fecha en UTC para que no haya desfasaje
    const dateObj = new Date(data.date);
    const utcDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000).toISOString();

    createIncome(
      {
        ...data,
        date: utcDate,
      },
      {
        onSuccess: () => {
          toast.success("Ingreso registrado correctamente");
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
      {/* Monto */}
      <div className="space-y-1">
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
      
      

      

      
      <div className="grid grid-cols-2 gap-3">
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
          {...register("category")}
        >
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
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Descripción</label>
        <Input 
          placeholder="Ej. Sueldo mensual" 
          {...register("description")} 
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>
    

      <Button type="submit" className="w-full mt-4" disabled={isPending}>
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
