import express from 'express';
import {
  getDailySales,
  getMonthlyRevenue,
  getProductPerformance,
  getInventoryReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'manager'));

router.get('/daily-sales', getDailySales);
router.get('/monthly-revenue', getMonthlyRevenue);
router.get('/product-performance', getProductPerformance);
router.get('/inventory', getInventoryReport);

export default router;
