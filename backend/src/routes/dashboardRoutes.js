import express from 'express';
import {
  getSummary,
  getRevenueAnalytics,
  getTopProductsAnalytics,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'manager'));

router.get('/summary', getSummary);
router.get('/revenue', getRevenueAnalytics);
router.get('/top-products', getTopProductsAnalytics);

export default router;
