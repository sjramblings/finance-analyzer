import { Router } from 'express';
import { BudgetService } from '../services/BudgetService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateId } from '../middleware/validation.js';

const router = Router();
const budgetService = new BudgetService();

// GET /api/budget
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const budgets = await budgetService.getAllBudgets();
    res.json(budgets);
  })
);

// GET /api/budget/active
router.get(
  '/active',
  asyncHandler(async (req, res) => {
    const budgets = await budgetService.getActiveBudgets();
    res.json(budgets);
  })
);

// GET /api/budget/status
router.get(
  '/status',
  asyncHandler(async (req, res) => {
    const { month } = req.query;
    const status = await budgetService.getBudgetStatus(month as string);
    res.json(status);
  })
);

// POST /api/budget
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { categoryId, amount, period } = req.body;
    if (!categoryId || !amount || !period) {
      return res.status(400).json({ error: 'categoryId, amount and period are required' });
    }

    const budget = await budgetService.updateBudget(
      categoryId,
      parseFloat(amount),
      period
    );
    res.json(budget);
  })
);

// PUT /api/budget/:categoryId
router.put(
  '/:categoryId',
  validateId,
  asyncHandler(async (req, res) => {
    const { amount, period } = req.body;
    if (!amount || !period) {
      return res.status(400).json({ error: 'amount and period are required' });
    }

    const budget = await budgetService.updateBudget(
      parseInt(req.params.categoryId, 10),
      parseFloat(amount),
      period
    );
    res.json(budget);
  })
);

// DELETE /api/budget/:id
router.delete(
  '/:id',
  validateId,
  asyncHandler(async (req, res) => {
    const result = await budgetService.deleteBudget(parseInt(req.params.id, 10));
    res.json(result);
  })
);

export default router;
