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
  interest_rate: z.number().min(0).max(1000).optional().nullable(),
});

export type DebtFormValues = z.infer<typeof debtSchema>;
