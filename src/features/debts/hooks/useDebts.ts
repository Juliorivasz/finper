import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { DebtFormValues, DebtChargeValues } from "../schemas/debtSchema";
import { Debt, DebtPayment, DebtModality, DebtCardBrand, DebtMovementType } from "../types";

export type { Debt, DebtPayment, DebtModality, DebtCardBrand, DebtMovementType };

export function useGetDebts() {
  return useQuery({
    queryKey: ["debts"],
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("debts")
        .select("*, debt_payments(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data as Debt[];
    },
  });
}

/**
 * Hook para obtener las tarjetas registradas previamente por el usuario
 */
export function useGetSavedCards() {
  const { data: debts } = useGetDebts();
  
  if (!debts) return [];
  
  const cardsMap = new Map<string, {
    bank: string;
    brand: string;
    alias: string;
    lastDigits: string;
    closingDate?: number | null;
  }>();

  for (const debt of debts) {
    if (debt.modality === "credit_card" && debt.card_bank && debt.card_brand) {
      const key = `${debt.card_bank}-${debt.card_brand}-${debt.card_last_digits || ''}`;
      if (!cardsMap.has(key)) {
        cardsMap.set(key, {
          bank: debt.card_bank,
          brand: debt.card_brand,
          alias: debt.card_alias || `${debt.card_brand} ${debt.card_bank}`,
          lastDigits: debt.card_last_digits || "",
          closingDate: debt.statement_closing_date,
        });
      }
    }
  }

  return Array.from(cardsMap.values());
}

export function useCreateDebt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newDebt: DebtFormValues) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("debts")
        .insert([{
          user_id: user.id,
          type: newDebt.type,
          amount: newDebt.amount,
          description: newDebt.description,
          due_date: newDebt.due_date || null,
          interest_rate: newDebt.interest_rate || null,
          status: "pending",
          modality: newDebt.modality || "simple",
          card_alias: newDebt.card_alias || null,
          card_bank: newDebt.card_bank || null,
          card_brand: newDebt.card_brand || null,
          card_last_digits: newDebt.card_last_digits || null,
          statement_closing_date: newDebt.statement_closing_date || null,
          installments_total: newDebt.installments_total || 1,
          installments_paid: newDebt.installments_paid || 0,
          allows_capital_amortization: newDebt.allows_capital_amortization || false,
        }])
        .select();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

/**
 * Registra un abono/pago a una deuda
 */
export function useCreateDebtPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      debt_id,
      amount,
      installment_number,
      description,
    }: {
      debt_id: string;
      amount: number;
      installment_number?: number | null;
      description?: string | null;
    }) => {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("debt_payments")
        .insert([{
          debt_id,
          amount,
          date: new Date().toISOString(),
          movement_type: "payment",
          installment_number: installment_number || null,
          description: description || null,
        }])
        .select();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

/**
 * Suma un consumo a una tarjeta de crédito o amplía el capital de una deuda
 */
export function useAddDebtCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      debt_id,
      amount,
      description,
      currentDebtAmount,
    }: DebtChargeValues & { currentDebtAmount: number }) => {
      const supabase = createClient();

      // 1. Registrar el movimiento de cargo
      const { error: paymentError } = await supabase
        .from("debt_payments")
        .insert([{
          debt_id,
          amount,
          date: new Date().toISOString(),
          movement_type: "charge",
          description,
        }]);

      if (paymentError) throw new Error(paymentError.message);

      // 2. Aumentar el capital acumulado de la deuda
      const newTotal = currentDebtAmount + amount;
      const { data, error: updateError } = await supabase
        .from("debts")
        .update({
          amount: newTotal,
          status: "pending",
        })
        .eq("id", debt_id)
        .select();

      if (updateError) throw new Error(updateError.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("debts")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
