import { Database } from '../database.js';

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
  category_id?: number;
  startDate?: string;
  endDate?: string;
  merchant?: string;
  minAmount?: number;
  maxAmount?: number;
}

export class TransactionRepository {
  constructor(private db: Database) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const result = await this.db.run(
      `INSERT INTO transactions (
        date, description, amount, category_id, merchant, account_name,
        account_last4, transaction_type, original_description, notes,
        is_recurring, recurring_group_id, confidence_score, manually_categorized
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.date,
        transaction.description,
        transaction.amount,
        transaction.category_id || null,
        transaction.merchant || null,
        transaction.account_name || null,
        transaction.account_last4 || null,
        transaction.transaction_type,
        transaction.original_description || null,
        transaction.notes || null,
        transaction.is_recurring || 0,
        transaction.recurring_group_id || null,
        transaction.confidence_score || null,
        transaction.manually_categorized || 0,
      ]
    );

    return { ...transaction, id: result.lastID };
  }

  async findById(id: number): Promise<Transaction | undefined> {
    return this.db.get('SELECT * FROM transactions WHERE id = ?', [id]);
  }

  async findAll(filter: TransactionFilter = {}): Promise<{ transactions: Transaction[]; total: number }> {
    const {
      page = 1,
      limit = 50,
      category_id,
      startDate,
      endDate,
      merchant,
      minAmount,
      maxAmount,
    } = filter;

    let whereClauses: string[] = [];
    let params: any[] = [];

    if (category_id) {
      whereClauses.push('category_id = ?');
      params.push(category_id);
    }

    if (startDate) {
      whereClauses.push('date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereClauses.push('date <= ?');
      params.push(endDate);
    }

    if (merchant) {
      whereClauses.push('merchant LIKE ?');
      params.push(`%${merchant}%`);
    }

    if (minAmount !== undefined) {
      whereClauses.push('amount >= ?');
      params.push(minAmount);
    }

    if (maxAmount !== undefined) {
      whereClauses.push('amount <= ?');
      params.push(maxAmount);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Get total count
    const countResult = await this.db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM transactions ${whereClause}`,
      params
    );
    const total = countResult?.count || 0;

    // Get paginated results
    const offset = (page - 1) * limit;
    const transactions = await this.db.all<Transaction>(
      `SELECT * FROM transactions ${whereClause} ORDER BY date DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { transactions, total };
  }

  async update(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const fields = Object.keys(updates)
      .filter((key) => updates[key as keyof Transaction] !== undefined)
      .map((key) => `${key} = ?`);

    if (fields.length === 0) {
      return this.findById(id);
    }

    const values = Object.values(updates).filter((val) => val !== undefined);

    await this.db.run(
      `UPDATE transactions SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.run('DELETE FROM transactions WHERE id = ?', [id]);
    return result.changes > 0;
  }

  async bulkCreate(transactions: Transaction[]): Promise<number> {
    let count = 0;
    for (const transaction of transactions) {
      await this.create(transaction);
      count++;
    }
    return count;
  }
}
