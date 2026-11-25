"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateIncome } from "../hooks/useIncomes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
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

const CATEGORY_OPTIONS = [
  { value: "Sueldo", label: "Sueldo" },
  { value: "Honorarios", label: "Honorarios" },
  { value: "Ventas", label: "Ventas" },
  { value: "Rendimientos", label: "Rendimientos" },
  { value: "Transferencias", label: "Transferencias" },
  { value: "Otros", label: "Otros" },
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Fecha */}
        <FormField label="Fecha" error={errors.date?.message} required>
          <Input type="date" {...register("date")} />
        </FormField>

        {/* Categoría */}
        <FormField label="Categoría" error={errors.category?.message} required>
          <Select
            options={CATEGORY_OPTIONS}
            placeholder="Selecciona..."
            {...register("category")}
          />
        </FormField>
      </div>

      {/* Descripción */}
      <FormField label="Descripción" error={errors.description?.message} required>
        <Input 
          placeholder="Ej: Sueldo mensual..." 
          {...register("description")} 
        />
      </FormField>

      <Button type="submit" className="w-full mt-1 cursor-pointer" disabled={isPending}>
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
