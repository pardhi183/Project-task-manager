import { body } from 'express-validator';

const passwordRules = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Password must contain at least one capital letter')
  .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character')
  .custom((password, { req }) => {
    const emailName = req.body.email?.split('@')[0]?.toLowerCase();
    if (emailName && password.toLowerCase().includes(emailName)) {
      throw new Error('Password cannot contain your email name');
    }
    return true;
  });

export const signupValidator = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('mobileNumber')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10 digit mobile number'),
  passwordRules,
  body('role').optional().isIn(['Admin', 'User', 'Employee']).withMessage('Role must be Admin, User, or Employee'),
  body('employeeId')
    .if(body('role').equals('Employee'))
    .isInt({ min: 5000, max: 10000 })
    .withMessage('Employee ID must be between 5000 and 10000')
];

export const loginValidator = [
  body('role').isIn(['Admin', 'User', 'Employee']).withMessage('Choose whether you are signing in as Admin, User, or Employee'),
  body('email').trim().notEmpty().withMessage('Email, mobile number, or employee ID is required'),
  body('password').notEmpty().withMessage('Password is required')
];

export const forgotPasswordValidator = [
  body('mobileNumber')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10 digit mobile number')
];

export const verifyPasswordOtpValidator = [
  body('mobileNumber')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10 digit mobile number'),
  body('otp').trim().isLength({ min: 6, max: 6 }).isNumeric().withMessage('Enter the 6 digit OTP')
];

export const resetPasswordValidator = [
  body('mobileNumber')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10 digit mobile number'),
  body('otp').trim().isLength({ min: 6, max: 6 }).isNumeric().withMessage('Enter the 6 digit OTP'),
  passwordRules
];
