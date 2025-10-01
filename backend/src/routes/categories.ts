import { Router } from 'express';
import { CategoryService } from '../services/CategoryService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateId, validateBody } from '../middleware/validation.js';

const router = Router();
const categoryService = new CategoryService();

// GET /api/categories
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  })
);

// GET /api/categories/:id
router.get(
  '/:id',
  validateId,
  asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryById(parseInt(req.params.id, 10));
    res.json(category);
  })
);

// POST /api/categories
router.post(
  '/',
  validateBody(['name']),
  asyncHandler(async (req, res) => {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  })
);

// PUT /api/categories/:id
router.put(
  '/:id',
  validateId,
  asyncHandler(async (req, res) => {
    const category = await categoryService.updateCategory(parseInt(req.params.id, 10), req.body);
    res.json(category);
  })
);

// DELETE /api/categories/:id
router.delete(
  '/:id',
  validateId,
  asyncHandler(async (req, res) => {
    const result = await categoryService.deleteCategory(parseInt(req.params.id, 10));
    res.json(result);
  })
);

export default router;
