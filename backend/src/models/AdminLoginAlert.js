import mongoose from 'mongoose';

const adminLoginAlertSchema = new mongoose.Schema(
  {
    loginIdentifier: {
      type: String,
      required: true,
      trim: true
    },
    adminName: {
      type: String,
      trim: true
    },
    adminEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved'],
      default: 'Pending'
    },
    loginStatus: {
      type: String,
      enum: ['Successful', 'Wrong password', 'Blocked'],
      required: true
    },
    attemptedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('AdminLoginAlert', adminLoginAlertSchema);
