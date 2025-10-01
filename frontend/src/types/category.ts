export interface Category {
  id?: number;
  name: string;
  parent_id?: number;
  icon?: string;
  color?: string;
  budget_amount?: number;
  is_system?: boolean;
  created_at?: string;
  updated_at?: string;
}
