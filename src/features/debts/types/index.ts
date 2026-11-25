export type DebtModality = "credit_card" | "personal_loan" | "bank_loan" | "simple";

export type DebtCardBrand =
  | "Visa"
  | "Mastercard"
  | "American Express"
  | "Cabal"
  | "Naranja"
  | "Otra";

export type DebtMovementType = "payment" | "charge";

export interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  date: string;
  created_at: string;
  movement_type?: DebtMovementType;
  description?: string | null;
  installment_number?: number | null;
}

export interface Debt {
  id: string;
  user_id: string;
  type: "payable" | "receivable";
  amount: number;
  description: string;
  due_date: string | null;
  status: "pending" | "paid";
  interest_rate?: number | null;
  created_at: string;
  modality?: DebtModality;
  card_alias?: string | null;
  card_bank?: string | null;
  card_brand?: string | null;
  card_last_digits?: string | null;
  statement_closing_date?: number | null;
  installments_total?: number;
  installments_paid?: number;
  allows_capital_amortization?: boolean;
  debt_payments?: DebtPayment[];
}
