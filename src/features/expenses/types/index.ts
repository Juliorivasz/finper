export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  user_id?: string;
}

export interface Expense {
  id: string;
  user_id?: string;
  amount: number;
  date: string;
  category_id: string;
  description?: string;
  is_recurring: boolean;
  created_at: string;
  categories?: Category; // Join relation from Supabase
}
