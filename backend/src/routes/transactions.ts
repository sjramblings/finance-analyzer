import { Router } from 'express';
import { TransactionService } from '../services/TransactionService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateId } from '../middleware/validation.js';

const router = Router();
const transactionService = new TransactionService();

// GET /api/transactions
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      page,
      limit,
      category,
      startDate,
      endDate,
      merchant,
      minAmount,
      maxAmount,
    } = req.query;

    const filter = {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      category_id: category ? parseInt(category as string, 10) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
      merchant: merchant as string,
      minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
    };

    const result = await transactionService.getTransactions(filter);
    res.json(result);
  })
);

// GET /api/transactions/stats
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const stats = await transactionService.getStatistics(
      startDate as string,
      endDate as string
    );
    res.json(stats);
  })
);

// GET /api/transactions/:id
router.get(
  '/:id',
  validateId,
  asyncHandler(async (req, res) => {
    const transaction = await transactionService.getTransactionById(parseInt(req.params.id, 10));
    res.json(transaction);
  })
);

// PUT /api/transactions/:id
router.put(
  '/:id',
  validateId,
  asyncHandler(async (req, res) => {
    const transaction = await transactionService.updateTransaction(
      parseInt(req.params.id, 10),
      req.body
    );
    res.json(transaction);
  })
);

// PUT /api/transactions/:id/category
router.put(
  '/:id/category',
  validateId,
  asyncHandler(async (req, res) => {
    const { category_id } = req.body;
    if (!category_id) {
      return res.status(400).json({ error: 'category_id is required' });
    }

    const transaction = await transactionService.updateCategory(
      parseInt(req.params.id, 10),
      category_id
    );
    res.json(transaction);
  })
);

// DELETE /api/transactions/:id
router.delete(
  '/:id',
  validateId,
  asyncHandler(async (req, res) => {
    const result = await transactionService.deleteTransaction(parseInt(req.params.id, 10));
    res.json(result);
  })
);

export default router;
