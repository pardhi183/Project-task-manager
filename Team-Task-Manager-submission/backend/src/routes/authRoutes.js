import express from 'express';
import { getMe, login, signup } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { loginValidator, signupValidator } from '../validators/authValidators.js';

const router = express.Router();

router.post('/signup', signupValidator, validate, signup);
router.post('/login', loginValidator, validate, login);
router.get('/me', protect, getMe);

export default router;
