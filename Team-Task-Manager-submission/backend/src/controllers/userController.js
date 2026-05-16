import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendApprovalSms } from '../utils/sms.js';

export const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find({ role: { $in: ['Admin', 'User', 'Employee', 'Member'] } }).sort({ name: 1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role: req.body.role },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const getProfiles = async (req, res, next) => {
  try {
    const users = req.user.role === 'Admin'
      ? await User.find().sort({ role: 1, name: 1 })
      : [req.user];

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const getPendingApprovals = async (_req, res, next) => {
  try {
    const users = await User.find({ approvalStatus: 'Pending' }).sort({ approvalRequestedAt: 1, createdAt: 1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const getWelcomeMembers = async (_req, res, next) => {
  try {
    const users = await User.find({ firstPunchedInAt: { $exists: true, $ne: null } })
      .sort({ firstPunchedInAt: -1 })
      .limit(8);
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.approvalStatus = 'Approved';
    user.approvedAt = new Date();
    await user.save({ validateBeforeSave: false });

    const smsResult = await sendApprovalSms({ to: user.mobileNumber });
    res.json({
      user,
      message: smsResult.delivered
        ? 'Login credentials approved and phone message sent.'
        : `Login credentials approved. SMS service is not configured. Message: ${smsResult.message}`
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, designation, productivity, profilePicture } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        name,
        designation,
        productivity,
        profilePicture
      },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Project.updateMany(
      { teamMembers: user._id },
      { $pull: { teamMembers: user._id } }
    );
    await Task.updateMany(
      { assignedUser: user._id },
      { $unset: { assignedUser: '' }, status: 'Todo' }
    );
    await Task.updateMany(
      { assignedUsers: user._id },
      { $pull: { assignedUsers: user._id } }
    );
    await user.deleteOne();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
