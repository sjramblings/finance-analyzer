import { Router } from 'express';
import transactionRoutes from './transactions.js';
import uploadRoutes from './upload.js';
import categoryRoutes from './categories.js';
import budgetRoutes from './budget.js';
import insightRoutes from './insights.js';
import chatRoutes from './chat.js';

const router = Router();

router.use('/transactions', transactionRoutes);
router.use('/upload', uploadRoutes);
router.use('/categories', categoryRoutes);
router.use('/budget', budgetRoutes);
router.use('/insights', insightRoutes);
router.use('/chat', chatRoutes);

export default router;
