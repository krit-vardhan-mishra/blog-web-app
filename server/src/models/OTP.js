import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['signup', 'reset'],
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300
  }
}, {
  timestamps: true
});

OTPSchema.index({ email: 1, type: 1, createdAt: 1 });

const OTP = mongoose.model('OTP', OTPSchema);
export default OTP;