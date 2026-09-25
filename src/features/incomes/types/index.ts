export interface Income {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
}

export interface CreateIncomeInput {
  amount: number;
  description: string;
  category?: string;
  date: string;
}
