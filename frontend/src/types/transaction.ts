export interface Transaction {
  id?: number;
  date: string;
  description: string;
  amount: number;
  category_id?: number;
  merchant?: string;
  account_name?: string;
  account_last4?: string;
  transaction_type: 'debit' | 'credit' | 'transfer';
  original_description?: string;
  notes?: string;
  is_recurring?: boolean;
  recurring_group_id?: number;
  confidence_score?: number;
  manually_categorized?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionFilter {
  page?: number;
  limit?: number;
  category?: number;
  startDate?: string;
  endDate?: string;
  merchant?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
}

export interface TransactionStats {
  totalSpent: number;
  totalIncome: number;
  netCashFlow: number;
  transactionCount: number;
  byCategory: Record<string, number>;
}
