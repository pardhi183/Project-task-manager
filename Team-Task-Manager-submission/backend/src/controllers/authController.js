import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordResetOtp } from '../utils/mailer.js';
import { signToken } from '../utils/token.js';

const authResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({ token, user });
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    authResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    authResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const createOtp = () => String(crypto.randomInt(100000, 1000000));

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+passwordResetOtpHash +passwordResetExpires +passwordResetAttempts');

    if (!user) {
      return res.status(404).json({ message: 'No account was found with this email address' });
    }

    const otp = createOtp();
    user.passwordResetOtpHash = hashOtp(otp);
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetAttempts = 0;
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetOtp({ to: user.email, otp });
    } catch (mailError) {
      user.passwordResetOtpHash = undefined;
      user.passwordResetExpires = undefined;
      user.passwordResetAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return res.status(503).json({ message: mailError.message });
    }

    return res.json({ message: 'OTP sent to your registered email address' });
  } catch (error) {
    return next(error);
  }
};

export const verifyPasswordOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+passwordResetOtpHash +passwordResetExpires +passwordResetAttempts');

    if (!user || !user.passwordResetOtpHash || !user.passwordResetExpires) {
      return res.status(400).json({ message: 'Request a new OTP before continuing' });
    }

    if (user.passwordResetExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP' });
    }

    if (user.passwordResetAttempts >= 5) {
      return res.status(429).json({ message: 'Too many wrong OTP attempts. Please request a new OTP' });
    }

    if (user.passwordResetOtpHash !== hashOtp(otp)) {
      user.passwordResetAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    return res.json({ message: 'OTP verified. Create a new password' });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordResetOtpHash +passwordResetExpires +passwordResetAttempts');

    if (!user || !user.passwordResetOtpHash || !user.passwordResetExpires) {
      return res.status(400).json({ message: 'Request a new OTP before resetting your password' });
    }

    if (user.passwordResetExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP' });
    }

    if (user.passwordResetAttempts >= 5) {
      return res.status(429).json({ message: 'Too many wrong OTP attempts. Please request a new OTP' });
    }

    if (user.passwordResetOtpHash !== hashOtp(otp)) {
      user.passwordResetAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.password = password;
    user.passwordResetOtpHash = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetAttempts = 0;
    await user.save();

    return res.json({ message: 'Password updated successfully. You can now log in with the new password' });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};
