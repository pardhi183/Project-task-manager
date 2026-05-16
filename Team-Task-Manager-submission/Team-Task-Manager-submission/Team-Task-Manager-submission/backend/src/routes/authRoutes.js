import express from 'express';
import {
  forgotPassword,
  getMe,
  login,
  resetPassword,
  signup,
  verifyPasswordOtp
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  forgotPasswordValidator,
  loginValidator,
  resetPasswordValidator,
  signupValidator,
  verifyPasswordOtpValidator
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/signup', signupValidator, validate, signup);
router.post('/login', loginValidator, validate, login);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/verify-password-otp', verifyPasswordOtpValidator, validate, verifyPasswordOtp);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);
router.get('/me', protect, getMe);

export default router;
