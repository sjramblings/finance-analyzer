import { Database } from '../database.js';

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

export class BudgetRepository {
  constructor(private db: Database) {}

  async create(budget: Budget): Promise<Budget> {
    const result = await this.db.run(
      `INSERT INTO budgets (category_id, amount, period, start_date, end_date)
       VALUES (?, ?, ?, ?, ?)`,
      [budget.category_id, budget.amount, budget.period, budget.start_date, budget.end_date || null]
    );

    return { ...budget, id: result.lastID };
  }

  async findAll(): Promise<Budget[]> {
    return this.db.all('SELECT * FROM budgets ORDER BY start_date DESC');
  }

  async findById(id: number): Promise<Budget | undefined> {
    return this.db.get('SELECT * FROM budgets WHERE id = ?', [id]);
  }

  async findByCategoryId(categoryId: number): Promise<Budget[]> {
    return this.db.all('SELECT * FROM budgets WHERE category_id = ? ORDER BY start_date DESC', [
      categoryId,
    ]);
  }

  async findActiveBudgets(date: string = new Date().toISOString().split('T')[0]): Promise<Budget[]> {
    return this.db.all(
      `SELECT * FROM budgets
       WHERE start_date <= ? AND (end_date IS NULL OR end_date >= ?)
       ORDER BY category_id`,
      [date, date]
    );
  }

  async update(id: number, updates: Partial<Budget>): Promise<Budget | undefined> {
    const fields = Object.keys(updates)
      .filter((key) => updates[key as keyof Budget] !== undefined)
      .map((key) => `${key} = ?`);

    if (fields.length === 0) {
      return this.findById(id);
    }

    const values = Object.values(updates).filter((val) => val !== undefined);

    await this.db.run(
      `UPDATE budgets SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.run('DELETE FROM budgets WHERE id = ?', [id]);
    return result.changes > 0;
  }
}
