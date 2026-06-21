import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin', 'manager'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('admin', 'manager'), updateProduct)
  .delete(protect, authorize('admin', 'manager'), deleteProduct);

export default router;
