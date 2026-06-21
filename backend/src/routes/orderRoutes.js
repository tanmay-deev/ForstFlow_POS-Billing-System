import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getInvoice,
  deleteAllOrders,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, getOrders)
  .delete(protect, deleteAllOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .patch(protect, updateOrderStatus);

router.route('/:id/invoice')
  .get(protect, getInvoice);

export default router;
