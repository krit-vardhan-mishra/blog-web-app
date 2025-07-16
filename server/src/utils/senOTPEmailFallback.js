import nodemailer from 'nodemailer';
import { otpRateLimiter } from '../middleware/rateLimiter.js';

// Fallback email service using App Password (more reliable than OAuth2)
const sendOTPEmailFallback = async (toEmail, otp, type, ipAddress) => {
  try {
    console.log('=== USING FALLBACK EMAIL SERVICE ===');
    
    // Check rate limit
    await otpRateLimiter.consume(`${toEmail}:${type}`);

    // Create transporter with App Password (more reliable)
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password instead of OAuth2
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter
    await transporter.verify();
    console.log('✅ Fallback email transporter verified');

    const emailConfig = {
      signup: {
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Email Verification</h2>
            <p>Your verification code is:</p>
            <div style="background: #f3f4f6; padding: 10px; border-radius: 5px; display: inline-block;">
              <strong style="font-size: 18px;">${otp}</strong>
            </div>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr>
            <p style="color: #6b7280; font-size: 12px;">Request IP: ${ipAddress}</p>
          </div>
        `
      },
      reset: {
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Password Reset</h2>
            <p>We received a request to reset your password. Your OTP is:</p>
            <div style="background: #f3f4f6; padding: 10px; border-radius: 5px; display: inline-block;">
              <strong style="font-size: 18px;">${otp}</strong>
            </div>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request this, please secure your account immediately.</p>
            <hr>
            <p style="color: #6b7280; font-size: 12px;">Request IP: ${ipAddress}</p>
          </div>
        `
      }
    };

    const mailOptions = {
      from: `"SecureApp" <${process.env.SENDER_EMAIL}>`,
      to: toEmail,
      subject: emailConfig[type].subject,
      html: emailConfig[type].html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Fallback email sent successfully:', result.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ FALLBACK EMAIL ERROR:', error);
    throw new Error('Failed to send OTP. Please try again later.');
  }
};

export default sendOTPEmailFallback;