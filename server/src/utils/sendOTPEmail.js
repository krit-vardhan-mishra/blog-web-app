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
        subject: 'Verify Your Blog Web App Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1C222A; color: #ffffff; border-radius: 8px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%); padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff;">Blog Web App</h1>
              <p style="margin: 5px 0 0; font-size: 14px; color: #d1d5db;">Verify Your Email Address</p>
            </div>
            <!-- Body -->
            <div style="padding: 30px; background: #2A2E36; border: 1px solid #374151; border-top: none; border-radius: 0 0 8px 8px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; padding: 12px 20px; background: #2563eb; border-radius: 50%; margin-bottom: 15px;">
                  <svg style="width: 24px; height: 24px; fill: #ffffff;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h2 style="color: #2563eb; font-size: 20px; font-weight: bold; margin: 0;">Welcome to Blog Web App!</h2>
              </div>
              <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 20px;">
                Thank you for joining us. Please use the following OTP to verify your account:
              </p>
              <div style="text-align: center; margin: 20px 0;">
                <span style="display: inline-block; background: #2563eb; color: #ffffff; padding: 15px 25px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
                  ${otp}
                </span>
              </div>
              <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-bottom: 10px;">
                ⏰ This OTP will expire in 5 minutes.
              </p>
              <p style="color: #9ca3af; font-size: 14px; text-align: center;">
                If you didn’t request this, please ignore this email or contact support.
              </p>
              <hr style="border: none; border-top: 1px solid #374151; margin: 25px 0;">
              <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
                📍 Request IP: ${ipAddress}<br>
                🕒 Sent at: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        `
      },
      reset: {
        subject: 'Blog Web App Password Reset',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1C222A; color: #ffffff; border-radius: 8px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc3545 0%, #991b1b 100%); padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff;">Blog Web App</h1>
              <p style="margin: 5px 0 0; font-size: 14px; color: #d1d5db;">Password Reset Request</p>
            </div>
            <!-- Body -->
            <div style="padding: 30px; background: #2A2E36; border: 1px solid #374151; border-top: none; border-radius: 0 0 8px 8px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; padding: 12px 20px; background: #dc3545; border-radius: 50%; margin-bottom: 15px;">
                  <svg style="width: 24px; height: 24px; fill: #ffffff;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h2 style="color: #dc3545; font-size: 20px; font-weight: bold; margin: 0;">Reset Your Password</h2>
              </div>
              <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 20px;">
                We received a request to reset your password. Use the following OTP to proceed:
              </p>
              <div style="text-align: center; margin: 20px 0;">
                <span style="display: inline-block; background: #dc3545; color: #ffffff; padding: 15px 25px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
                  ${otp}
                </span>
              </div>
              <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-bottom: 10px;">
                ⏰ This OTP will expire in 5 minutes.
              </p>
              <div style="background: #7f1d1d; border: 1px solid #b91c1c; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="color: #f87171; font-size: 14px; text-align: center; margin: 0;">
                  ⚠️ <strong>Security Notice:</strong> If you didn’t request this, please secure your account immediately and contact support.
                </p>
              </div>
              <hr style="border: none; border-top: 1px solid #374151; margin: 25px 0;">
              <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
                📍 Request IP: ${ipAddress}<br>
                🕒 Sent at: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        `
      }
    };

    const mailOptions = {
      from: `"Blog Web App" <${SENDER_EMAIL}>`,
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