import express from 'express';
import { param } from 'express-validator';
import { approveAdminLoginAlert, getAdminLoginAlerts } from '../controllers/adminLoginAlertController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect, authorize('Admin'));

router.get('/', getAdminLoginAlerts);
router.patch(
  '/:alertId/approve',
  [param('alertId').isMongoId().withMessage('Valid alert id is required')],
  validate,
  approveAdminLoginAlert
);

export default router;
