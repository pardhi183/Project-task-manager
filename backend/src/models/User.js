import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false
    },
    employeeId: {
      type: Number,
      min: 5000,
      max: 10000,
      unique: true,
      sparse: true
    },
    profilePicture: {
      type: String,
      trim: true,
      default: ''
    },
    designation: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ''
    },
    productivity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    approvalStatus: {
      type: String,
      enum: ['Pending', 'Approved'],
      default: 'Approved'
    },
    approvalRequestedAt: Date,
    approvedAt: Date,
    firstPunchedInAt: Date,
    role: {
      type: String,
      enum: ['Admin', 'User', 'Employee', 'Member'],
      default: 'User'
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false
    },
    passwordResetOtpHash: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    passwordResetAttempts: {
      type: Number,
      default: 0,
      select: false
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isSamePassword = function isSamePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.password;
  delete user.passwordResetOtpHash;
  delete user.passwordResetExpires;
  delete user.passwordResetAttempts;
  delete user.failedLoginAttempts;
  if (user.role === 'Member') user.role = 'User';
  return user;
};

export default mongoose.model('User', userSchema);
