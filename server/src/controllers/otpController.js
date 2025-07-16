import User from '../models/User.js';
import OTP from '../models/OTP.js';
import bcrypt from 'bcryptjs';
import sendOTPEmail from '../utils/sendOTPEmail.js';

export const forgotPassword = async (req, res) => {
  try {
    console.log('=== FORGOT PASSWORD REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request IP:', req.ip);
    
    const { email } = req.body;
    
    // Validate email
    if (!email) {
      console.log('❌ Email is missing');
      return res.status(400).json({ message: 'Email is required' });
    }
    
    console.log('🔍 Looking for user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User found:', user.name);

    // Delete any existing OTP for this email and type
    console.log('🗑️ Deleting existing OTPs...');
    const deletedCount = await OTP.deleteMany({ email, type: 'reset' });
    console.log(`Deleted ${deletedCount.deletedCount} existing OTPs`);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    console.log('🔑 Generated OTP:', otp);
    console.log('📍 IP Address:', ipAddress);

    // Create OTP record first
    console.log('💾 Creating OTP record...');
    const otpRecord = await OTP.create({ 
      email, 
      otp, 
      type: 'reset', 
      ipAddress 
    });
    console.log('✅ OTP record created:', otpRecord._id);

    // Then send email
    console.log('📧 Sending email...');
    await sendOTPEmail(email, otp, 'reset', ipAddress);
    console.log('✅ Email sent successfully');

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('❌ FORGOT PASSWORD ERROR:', error);
    console.error('Error stack:', error.stack);
    
    // Send more specific error message
    let errorMessage = 'Internal server error';
    if (error.message.includes('OAuth2')) {
      errorMessage = 'Email service temporarily unavailable. Please try again later.';
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'Too many requests. Please wait before trying again.';
    } else if (error.message.includes('invalid_grant')) {
      errorMessage = 'Email authentication failed. Please contact support.';
    }
    
    res.status(500).json({ 
      message: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'reset',
      createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (otpRecord.attempts >= 3) {
      return res.status(400).json({ message: 'OTP verification attempts exceeded' });
    }

    await OTP.findByIdAndUpdate(otpRecord._id, {
      $inc: { attempts: 1 }
    });

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'reset',
      createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (otpRecord.attempts >= 3) {
      return res.status(400).json({ message: 'OTP verification attempts exceeded' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};