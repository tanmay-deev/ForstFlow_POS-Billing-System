import express from 'express';
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../controllers/offerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getOffers)
  .post(protect, authorize('admin', 'manager'), createOffer);

router.route('/:id')
  .put(protect, authorize('admin', 'manager'), updateOffer)
  .delete(protect, authorize('admin', 'manager'), deleteOffer);

export default router;
