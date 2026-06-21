import express from 'express';
import {
  getInventoryStatus,
  restockProduct,
  getInventoryLogs,
  deleteAllInventoryLogs,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'manager'));

router.route('/').get(getInventoryStatus);
router.route('/restock/:productId').patch(restockProduct);
router.route('/logs').get(getInventoryLogs).delete(deleteAllInventoryLogs);

export default router;
