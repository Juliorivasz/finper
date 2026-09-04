import { z } from "zod";

export const expenseSchema = z.object({
  amount: z.number({ message: "Debe ser un número válido" })
    .positive({ message: "El monto debe ser mayor a 0" }),
  date: z.string().min(1, { message: "La fecha es requerida" }),
  category_id: z.string().uuid({ message: "Por favor selecciona una categoría válida" }),
  description: z.string().optional(),
  is_recurring: z.boolean(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
