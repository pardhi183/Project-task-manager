import User from '../models/User.js';
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

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};
