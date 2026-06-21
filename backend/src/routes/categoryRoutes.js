import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin', 'manager'), createCategory);

router.route('/:id')
  .put(protect, authorize('admin', 'manager'), updateCategory)
  .delete(protect, authorize('admin', 'manager'), deleteCategory);

export default router;
