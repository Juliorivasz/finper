import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { DebtFormValues } from "../schemas/debtSchema";

export interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  type: "payable" | "receivable";
  amount: number;
  description: string;
  due_date: string | null;
  status: "pending" | "paid";
  created_at: string;
  debt_payments?: DebtPayment[];
}

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

export function useCreateDebtPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ debt_id, amount }: { debt_id: string; amount: number }) => {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("debt_payments")
        .insert([{
          debt_id,
          amount,
          date: new Date().toISOString(),
        }])
        .select();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
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
          status: "pending",
        }])
        .select();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
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
    },
  });
}
