import express from 'express';
import { body, param } from 'express-validator';
import { createNotification, getNotifications, markNotificationRead } from '../controllers/notificationController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.post(
  '/',
  authorize('Admin'),
  [
    body('title').trim().isLength({ min: 2, max: 120 }).withMessage('Title must be 2-120 characters'),
    body('message').trim().isLength({ min: 2, max: 500 }).withMessage('Message must be 2-500 characters')
  ],
  validate,
  createNotification
);
router.patch(
  '/:notificationId/read',
  [param('notificationId').isMongoId().withMessage('Valid notification id is required')],
  validate,
  markNotificationRead
);

export default router;
