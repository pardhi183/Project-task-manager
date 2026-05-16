import express from 'express';
import { body, param } from 'express-validator';
import { deleteUser, getUsers, updateUserRole } from '../controllers/userController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('Admin'), getUsers);
router.patch(
  '/:userId/role',
  authorize('Admin'),
  [
    param('userId').isMongoId().withMessage('Valid user id is required'),
    body('role').isIn(['Admin', 'User', 'Employee']).withMessage('Role must be Admin, User, or Employee')
  ],
  validate,
  updateUserRole
);
router.delete(
  '/:userId',
  authorize('Admin'),
  [param('userId').isMongoId().withMessage('Valid user id is required')],
  validate,
  deleteUser
);

export default router;
