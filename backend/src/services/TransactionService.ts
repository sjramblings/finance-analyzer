import { TransactionRepository, Transaction, TransactionFilter } from '../db/repositories/TransactionRepository.js';
import { CategoryRepository } from '../db/repositories/CategoryRepository.js';
import { db } from '../db/database.js';

export class TransactionService {
  private transactionRepo: TransactionRepository;
  private categoryRepo: CategoryRepository;

  constructor() {
    this.transactionRepo = new TransactionRepository(db);
    this.categoryRepo = new CategoryRepository(db);
  }

  async getTransactions(filter: TransactionFilter) {
    return this.transactionRepo.findAll(filter);
  }

  async getTransactionById(id: number) {
    const transaction = await this.transactionRepo.findById(id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return transaction;
  }

  async updateTransaction(id: number, updates: Partial<Transaction>) {
    const transaction = await this.transactionRepo.update(id, updates);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return transaction;
  }

  async updateCategory(id: number, categoryId: number) {
    // Verify category exists
    const category = await this.categoryRepo.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    return this.transactionRepo.update(id, {
      category_id: categoryId,
      manually_categorized: true,
    });
  }

  async deleteTransaction(id: number) {
    const success = await this.transactionRepo.delete(id);
    if (!success) {
      throw new Error('Transaction not found');
    }
    return { success: true };
  }

  async getStatistics(startDate?: string, endDate?: string) {
    const filter: TransactionFilter = {};
    if (startDate) filter.startDate = startDate;
    if (endDate) filter.endDate = endDate;

    const { transactions } = await this.transactionRepo.findAll(filter);

    const totalSpent = transactions
      .filter(t => t.transaction_type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
      .filter(t => t.transaction_type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory: Record<string, number> = {};
    for (const transaction of transactions) {
      if (transaction.transaction_type === 'debit' && transaction.category_id) {
        const category = await this.categoryRepo.findById(transaction.category_id);
        if (category) {
          byCategory[category.name] = (byCategory[category.name] || 0) + transaction.amount;
        }
      }
    }

    return {
      totalSpent,
      totalIncome,
      netCashFlow: totalIncome - totalSpent,
      transactionCount: transactions.length,
      byCategory,
    };
  }
}
