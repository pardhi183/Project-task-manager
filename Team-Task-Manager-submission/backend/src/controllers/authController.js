import crypto from 'crypto';
import AdminLoginAlert from '../models/AdminLoginAlert.js';
import User from '../models/User.js';
import { sendPasswordResetSmsOtp } from '../utils/sms.js';
import { signToken } from '../utils/token.js';

const authResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({ token, user });
};

const createAdminLoginAlert = async (user, loginIdentifier, loginStatus) => {
  if (user?.role !== 'Admin') return;

  await AdminLoginAlert.create({
    loginIdentifier,
    adminName: user.name,
    adminEmail: user.email,
    loginStatus,
    attemptedAt: new Date()
  });
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, mobileNumber, password, role, employeeId } = req.body;
    const user = await User.create({
      name,
      email,
      mobileNumber,
      password,
      role,
      employeeId: role === 'Employee' ? employeeId : undefined,
      approvalStatus: 'Pending',
      approvalRequestedAt: new Date()
    });
    return res.status(202).json({
      message: 'Approval pending from admin. You can login after admin approval.',
      approvalPending: true,
      user: {
        name: user.name,
        role: user.role,
        mobileNumber: user.mobileNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const loginValue = String(email).trim();
    const filter = { role };

    if (/^\d+$/.test(loginValue) && role === 'Employee' && loginValue.length < 10) {
      filter.employeeId = Number(loginValue);
    } else if (/^\d{10}$/.test(loginValue)) {
      filter.mobileNumber = loginValue;
    } else {
      filter.email = loginValue.toLowerCase();
    }

    const user = await User.findOne(filter).select('+password +failedLoginAttempts');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.approvalStatus === 'Pending') {
      return res.status(403).json({
        message: 'Approval pending from admin. You can login after admin approval.',
        approvalPending: true
      });
    }

    if (user.failedLoginAttempts >= 5) {
      await createAdminLoginAlert(user, loginValue, 'Blocked');
      return res.status(423).json({
        message: 'Too many wrong password attempts. Reset your password before logging in again',
        attemptsLeft: 0
      });
    }

    if (!(await user.matchPassword(password))) {
      user.failedLoginAttempts += 1;
      await user.save({ validateBeforeSave: false });
      await createAdminLoginAlert(user, loginValue, 'Wrong password');
      const attemptsLeft = Math.max(0, 5 - user.failedLoginAttempts);
      return res.status(401).json({
        message: `Wrong password. ${attemptsLeft} ${attemptsLeft === 1 ? 'try' : 'tries'} left out of 5`,
        attemptsLeft
      });
    }

    user.failedLoginAttempts = 0;
    await user.save({ validateBeforeSave: false });
    authResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const createOtp = () => String(crypto.randomInt(100000, 1000000));

export const forgotPassword = async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;
    const user = await User.findOne({ mobileNumber }).select('+password +passwordResetOtpHash +passwordResetExpires +passwordResetAttempts +failedLoginAttempts');

    if (!user) {
      return res.status(404).json({ message: 'No account was found with this mobile number' });
    }

    const otp = createOtp();
    user.passwordResetOtpHash = hashOtp(otp);
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetAttempts = 0;
    await user.save({ validateBeforeSave: false });

    try {
      const smsResult = await sendPasswordResetSmsOtp({ to: user.mobileNumber, otp });
      return res.json({
        message: smsResult.delivered
          ? 'OTP sent to your registered mobile number'
          : `SMS service is not configured. Test OTP: ${smsResult.otp}`,
        devOtp: smsResult.delivered ? undefined : smsResult.otp
      });
    } catch (smsError) {
      user.passwordResetOtpHash = undefined;
      user.passwordResetExpires = undefined;
      user.passwordResetAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return res.status(503).json({ message: smsError.message });
    }
  } catch (error) {
    return next(error);
  }
};

export const verifyPasswordOtp = async (req, res, next) => {
  try {
    const { mobileNumber, otp } = req.body;
    const user = await User.findOne({ mobileNumber }).select('+passwordResetOtpHash +passwordResetExpires +passwordResetAttempts');

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
    const { mobileNumber, otp, password } = req.body;
    const user = await User.findOne({ mobileNumber }).select('+password +passwordResetOtpHash +passwordResetExpires +passwordResetAttempts +failedLoginAttempts');

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

    if (await user.isSamePassword(password)) {
      return res.status(400).json({ message: 'New password cannot be the same as your old password' });
    }

    user.password = password;
    user.passwordResetOtpHash = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetAttempts = 0;
    user.failedLoginAttempts = 0;
    await user.save();

    return res.json({ message: 'Password updated successfully. You can now log in with the new password' });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};
