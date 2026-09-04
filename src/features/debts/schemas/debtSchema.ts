import { z } from "zod";

export const debtSchema = z.object({
  type: z.enum(["payable", "receivable"] as const, {
    error: "Debes seleccionar el tipo de deuda",
  }),
  amount: z.number({
    error: "El monto es obligatorio",
  }).positive("El monto debe ser mayor a 0"),
  description: z.string().min(1, "La descripción es obligatoria"),
  due_date: z.string().optional(),
});

export type DebtFormValues = z.infer<typeof debtSchema>;
