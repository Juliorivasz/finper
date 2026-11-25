import { z } from "zod";

export const debtSchema = z.object({
  type: z.enum(["payable", "receivable"] as const, {
    error: "Debes seleccionar el tipo de deuda",
  }),
  modality: z.enum(["credit_card", "personal_loan", "bank_loan", "simple"] as const),
  amount: z.number({
    error: "El monto es obligatorio",
  }).positive("El monto debe ser mayor a 0"),
  description: z.string().min(1, "La descripción es obligatoria"),
  due_date: z.string().optional().nullable(),
  interest_rate: z.number().min(0, "La tasa no puede ser negativa").max(1000).optional().nullable(),
  
  // Metadatos de tarjeta de crédito
  card_alias: z.string().optional().nullable(),
  card_bank: z.string().optional().nullable(),
  card_brand: z.string().optional().nullable(),
  card_last_digits: z.string().max(4, "Máximo 4 dígitos").optional().nullable(),
  statement_closing_date: z.number().min(1).max(31).optional().nullable(),
  
  // Cuotas y amortización
  installments_total: z.number().int().min(1, "Debe ser al menos 1 cuota"),
  installments_paid: z.number().int().min(0).optional(),
  allows_capital_amortization: z.boolean().optional(),
});

export type DebtFormValues = z.infer<typeof debtSchema>;

// Esquema para sumar consumos o ampliar deuda
export const debtChargeSchema = z.object({
  debt_id: z.string().min(1, "Deuda inválida"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  description: z.string().min(1, "El concepto o comercio es obligatorio"),
  date: z.string().optional(),
  installment_number: z.number().optional().nullable(),
});

export type DebtChargeValues = z.infer<typeof debtChargeSchema>;

// Esquema para abonos y pagos de cuota
export const debtPaymentSchema = z.object({
  debt_id: z.string().min(1, "Deuda inválida"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  is_capital_amortization: z.boolean().default(false),
  installment_number: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type DebtPaymentValues = z.infer<typeof debtPaymentSchema>;
