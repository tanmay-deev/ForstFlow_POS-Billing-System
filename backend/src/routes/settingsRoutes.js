import express from 'express';
import {
  getSettings,
  updateSettings,
} from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getSettings)
  .put(protect, authorize('admin'), updateSettings);

export default router;
