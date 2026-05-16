import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    dateKey: {
      type: String,
      required: true,
      index: true
    },
    punchInAt: {
      type: Date,
      required: true
    },
    punchOutAt: Date
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, dateKey: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
