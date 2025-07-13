import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { otpRateLimiter } from '../middleware/rateLimiter.js';
import OTP from '../models/OTP.js';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID, 
  CLIENT_SECRET, 
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendOTPEmail = async (toEmail, otp, type, ipAddress) => {
  try {
    // Check rate limit
    await otpRateLimiter.consume(`${toEmail}:${type}`);

    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: SENDER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

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
      from: `"SecureApp" <${SENDER_EMAIL}>`,
      to: toEmail,
      subject: emailConfig[type].subject,
      html: emailConfig[type].html
    };

    await transporter.sendMail(mailOptions);

    await OTP.create({
      email: toEmail,
      otp,
      type,
      ipAddress
    });

    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to send OTP. Please try again later.');
    }
  }
};

export default sendOTPEmail;