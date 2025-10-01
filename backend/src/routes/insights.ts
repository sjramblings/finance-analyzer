import { Router } from 'express';
import { InsightService } from '../services/InsightService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateId } from '../middleware/validation.js';

const router = Router();
const insightService = new InsightService();

// GET /api/insights
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { dismissed } = req.query;
    const dismissedBool = dismissed === 'true' ? true : dismissed === 'false' ? false : undefined;
    const insights = await insightService.getAllInsights(dismissedBool);
    res.json(insights);
  })
);

// POST /api/insights/generate
router.post(
  '/generate',
  asyncHandler(async (req, res) => {
    const result = await insightService.generateInsights();
    res.json(result);
  })
);

// PUT /api/insights/:id/dismiss
router.put(
  '/:id/dismiss',
  validateId,
  asyncHandler(async (req, res) => {
    const result = await insightService.dismissInsight(parseInt(req.params.id, 10));
    res.json(result);
  })
);

// DELETE /api/insights/:id
router.delete(
  '/:id',
  validateId,
  asyncHandler(async (req, res) => {
    const result = await insightService.deleteInsight(parseInt(req.params.id, 10));
    res.json(result);
  })
);

export default router;
