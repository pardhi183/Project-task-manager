import express from 'express';
import { body, param } from 'express-validator';
import { deleteUser, getProfiles, getUsers, updateUserProfile, updateUserRole } from '../controllers/userController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('Admin'), getUsers);
router.get('/profiles', getProfiles);
router.patch(
  '/:userId/profile',
  authorize('Admin'),
  [
    param('userId').isMongoId().withMessage('Valid user id is required'),
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }).withMessage('Name is too long'),
    body('designation').optional({ checkFalsy: true }).trim().isLength({ max: 80 }).withMessage('Designation is too long'),
    body('productivity').isInt({ min: 0, max: 100 }).withMessage('Productivity must be between 0 and 100'),
    body('profilePicture')
      .optional({ checkFalsy: true })
      .trim()
      .custom((value) => {
        if (/^data:image\/(png|jpeg|jpg|webp);base64,/.test(value)) return true;
        if (/^https?:\/\//.test(value)) return true;
        throw new Error('Profile picture must be an uploaded image or valid image URL');
      })
  ],
  validate,
  updateUserProfile
);
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
