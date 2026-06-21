import express from 'express';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
} from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'manager'));

router.route('/')
  .get(getEmployees)
  .post(createEmployee);

router.route('/:id')
  .put(updateEmployee);

router.route('/:id/deactivate')
  .patch(deactivateEmployee);

export default router;
