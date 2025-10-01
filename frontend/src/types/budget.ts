import { Category } from './category';

export interface Budget {
  id?: number;
  category_id: number;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetStatus {
  total_budget: number;
  total_spent: number;
  remaining: number;
  categories: {
    category: Category;
    budget: number;
    spent: number;
    percentage: number;
    status: 'under' | 'near' | 'over';
  }[];
}
