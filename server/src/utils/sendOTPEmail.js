import nodemailer from 'nodemailer';
import { otpRateLimiter } from '../middleware/rateLimiter.js';
import { EMAIL } from './constants.js';

const { EMAIL: SENDER_EMAIL, PASSWORD: SENDER_PASSWORD } = EMAIL.SENDER;

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SENDER_EMAIL,
      pass: SENDER_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendOTPEmail = async (toEmail, otp, type, ipAddress) => {
  try {
    if (!SENDER_EMAIL || !SENDER_PASSWORD) {
      throw new Error('Missing email configuration. Please set SENDER_EMAIL and SENDER_PASSWORD in .env file');
    }
    try {
      await otpRateLimiter.consume(`${toEmail}:${type}`);
    } catch (rateLimitError) {
      throw new Error('Too many OTP requests. Please wait before trying again.');
    }

    const transporter = createTransporter();

    try {
      await transporter.verify();
    } catch (verifyError) {
      throw new Error('Email service configuration error. Please check your email credentials.');
    }

    const emailConfig = {
      signup: {
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Email Verification</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <h2 style="color: #2563eb; margin-bottom: 20px;">Welcome to SecureApp!</h2>
              <p style="color: #495057; font-size: 16px; line-height: 1.6;">
                Thank you for signing up. Please use the following verification code to complete your registration:
              </p>
              <div style="background: #2563eb; color: white; padding: 15px 25px; border-radius: 8px; display: inline-block; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
                ${otp}
              </div>
              <p style="color: #6c757d; font-size: 14px; margin-top: 20px;">
                ⏰ This code will expire in 5 minutes.
              </p>
              <p style="color: #6c757d; font-size: 14px;">
                If you didn't request this verification, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #dee2e6; margin: 25px 0;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                📍 Request IP: ${ipAddress}<br>
                🕒 Sent at: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        `
      },
      reset: {
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <h2 style="color: #dc3545; margin-bottom: 20px;">Reset Your Password</h2>
              <p style="color: #495057; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Use the following OTP to proceed:
              </p>
              <div style="background: #dc3545; color: white; padding: 15px 25px; border-radius: 8px; display: inline-block; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
                ${otp}
              </div>
              <p style="color: #6c757d; font-size: 14px; margin-top: 20px;">
                ⏰ This code will expire in 5 minutes.
              </p>
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; font-size: 14px; margin: 0;">
                  ⚠️ <strong>Security Notice:</strong> If you didn't request this password reset, please secure your account immediately and contact support.
                </p>
              </div>
              <hr style="border: none; border-top: 1px solid #dee2e6; margin: 25px 0;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                📍 Request IP: ${ipAddress}<br>
                🕒 Sent at: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        `
      }
    };

    const mailOptions = {
      from: `"Blog-Web-App" <${SENDER_EMAIL}>`,
      to: toEmail,
      subject: emailConfig[type].subject,
      html: emailConfig[type].html
    };

    const result = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };

  } catch (error) {
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      throw new Error('Email authentication failed. Please check your email credentials and ensure you\'re using an App Password.');
    }

    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      throw new Error('Failed to connect to email service. Please check your internet connection.');
    }

    if (error.code === 'EMESSAGE' || error.responseCode === 550) {
      throw new Error('Email rejected by recipient server. Please check the recipient email address.');
    }

    if (error.message && error.message.includes('rate limit')) {
      throw error;
    }

    if (error.message && error.message.includes('Missing email configuration')) {
      throw error;
    }

    throw new Error(`Failed to send OTP email: ${error.message || 'Unknown error occurred'}`);
  }
};

export default sendOTPEmail;