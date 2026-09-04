import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ExpenseFormValues } from "../schemas/expenseSchema";
import { Expense, Category } from "../types";

export function useGetCategories() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw new Error(error.message);
      return data as Category[];
    },
  });
}

export function useGetExpenses() {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          categories (
            name,
            color,
            icon
          )
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw new Error(error.message);
      return data as Expense[];
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newExpense: ExpenseFormValues) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("expenses")
        .insert([{
          user_id: user.id,
          amount: newExpense.amount,
          category_id: newExpense.category_id,
          date: newExpense.date,
          description: newExpense.description,
          is_recurring: newExpense.is_recurring,
        }])
        .select();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      // Invalidar para refrescar la lista de gastos
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}
