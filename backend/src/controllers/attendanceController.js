import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

const getDateKey = () => new Date().toISOString().slice(0, 10);

const attendanceSummary = async (userId) => {
  const today = getDateKey();
  const records = await Attendance.find({ user: userId }).sort({ dateKey: -1 });
  const todayRecord = records.find((record) => record.dateKey === today);

  return {
    presentDays: records.length,
    today: todayRecord || null,
    isPunchedIn: Boolean(todayRecord && !todayRecord.punchOutAt)
  };
};

export const getAttendance = async (req, res, next) => {
  try {
    const myAttendance = await attendanceSummary(req.user._id);

    if (req.user.role === 'Admin') {
      const users = await User.find({ role: { $in: ['User', 'Employee', 'Member'] } }).sort({ name: 1 });
      const attendance = await Promise.all(
        users.map(async (user) => ({
          user,
          ...(await attendanceSummary(user._id))
        }))
      );
      return res.json({ attendance, myAttendance });
    }

    return res.json({ attendance: myAttendance });
  } catch (error) {
    return next(error);
  }
};

export const punchIn = async (req, res, next) => {
  try {
    const dateKey = getDateKey();
    const existing = await Attendance.findOne({ user: req.user._id, dateKey });

    if (existing?.punchInAt && !existing.punchOutAt) {
      return res.status(400).json({ message: 'You are already punched in for today' });
    }

    if (existing?.punchOutAt) {
      return res.status(400).json({ message: 'You already completed attendance for today' });
    }

    const attendance = await Attendance.create({
      user: req.user._id,
      dateKey,
      punchInAt: new Date()
    });

    const previousRecords = await Attendance.countDocuments({ user: req.user._id });
    if (previousRecords === 1 && !req.user.firstPunchedInAt) {
      req.user.firstPunchedInAt = attendance.punchInAt;
      await req.user.save({ validateBeforeSave: false });
    }

    return res.status(201).json({ attendance });
  } catch (error) {
    return next(error);
  }
};

export const punchOut = async (req, res, next) => {
  try {
    const attendance = await Attendance.findOne({
      user: req.user._id,
      dateKey: getDateKey()
    });

    if (!attendance) {
      return res.status(400).json({ message: 'Punch in before punching out' });
    }

    if (attendance.punchOutAt) {
      return res.status(400).json({ message: 'You are already punched out for today' });
    }

    attendance.punchOutAt = new Date();
    await attendance.save();

    return res.json({ attendance });
  } catch (error) {
    return next(error);
  }
};
