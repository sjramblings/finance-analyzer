import { BudgetRepository, Budget } from '../db/repositories/BudgetRepository.js';
import { CategoryRepository } from '../db/repositories/CategoryRepository.js';
import { TransactionRepository, TransactionFilter } from '../db/repositories/TransactionRepository.js';
import { db } from '../db/database.js';

export class BudgetService {
  private budgetRepo: BudgetRepository;
  private categoryRepo: CategoryRepository;
  private transactionRepo: TransactionRepository;

  constructor() {
    this.budgetRepo = new BudgetRepository(db);
    this.categoryRepo = new CategoryRepository(db);
    this.transactionRepo = new TransactionRepository(db);
  }

  async getAllBudgets() {
    return this.budgetRepo.findAll();
  }

  async getBudgetById(id: number) {
    const budget = await this.budgetRepo.findById(id);
    if (!budget) {
      throw new Error('Budget not found');
    }
    return budget;
  }

  async createBudget(budget: Budget) {
    // Verify category exists
    const category = await this.categoryRepo.findById(budget.category_id);
    if (!category) {
      throw new Error('Category not found');
    }

    return this.budgetRepo.create(budget);
  }

  async updateBudget(categoryId: number, amount: number, period: 'monthly' | 'quarterly' | 'yearly') {
    // Find existing budget for this category
    const budgets = await this.budgetRepo.findByCategoryId(categoryId);
    const activeBudget = budgets.find(b => !b.end_date || new Date(b.end_date) >= new Date());

    if (activeBudget) {
      return this.budgetRepo.update(activeBudget.id!, { amount, period });
    } else {
      return this.budgetRepo.create({
        category_id: categoryId,
        amount,
        period,
        start_date: new Date().toISOString().split('T')[0],
      });
    }
  }

  async getActiveBudgets() {
    const today = new Date().toISOString().split('T')[0];
    const budgets = await this.budgetRepo.findActiveBudgets(today);

    // Get spending for each budget
    const result = [];
    for (const budget of budgets) {
      const { transactions } = await this.transactionRepo.findAll({
        category_id: budget.category_id,
      });

      const spent = Math.abs(transactions
        .filter(t => t.transaction_type === 'debit')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0));

      result.push({
        ...budget,
        spent,
        remaining: budget.amount - spent,
      });
    }

    return result;
  }

  async getBudgetStatus(month?: string) {
    const date = month || new Date().toISOString().slice(0, 7); // YYYY-MM
    const startDate = `${date}-01`;
    const endDate = new Date(new Date(date).getFullYear(), new Date(date).getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    // Get active budgets
    const budgets = await this.budgetRepo.findActiveBudgets(startDate);

    // Get spending for each category
    const categories = [];
    let totalBudget = 0;
    let totalSpent = 0;

    for (const budget of budgets) {
      const category = await this.categoryRepo.findById(budget.category_id);
      if (!category) continue;

      const filter: TransactionFilter = {
        category_id: budget.category_id,
        startDate,
        endDate,
      };

      const { transactions } = await this.transactionRepo.findAll(filter);
      const spent = transactions
        .filter(t => t.transaction_type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const status = percentage >= 100 ? 'over' : percentage >= 80 ? 'near' : 'under';

      categories.push({
        category,
        budget: budget.amount,
        spent,
        percentage,
        status,
      });

      totalBudget += budget.amount;
      totalSpent += spent;
    }

    return {
      total_budget: totalBudget,
      total_spent: totalSpent,
      remaining: totalBudget - totalSpent,
      categories,
    };
  }

  async deleteBudget(id: number) {
    const success = await this.budgetRepo.delete(id);
    if (!success) {
      throw new Error('Budget not found');
    }
    return { success: true };
  }
}
