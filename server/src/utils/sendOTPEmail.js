import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { otpRateLimiter } from '../middleware/rateLimiter.js';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

console.log('=== EMAIL SERVICE CONFIGURATION ===');
console.log('CLIENT_ID:', CLIENT_ID ? 'SET' : 'MISSING');
console.log('CLIENT_SECRET:', CLIENT_SECRET ? 'SET' : 'MISSING');
console.log('REFRESH_TOKEN:', REFRESH_TOKEN ? 'SET' : 'MISSING');
console.log('SENDER_EMAIL:', SENDER_EMAIL ? 'SET' : 'MISSING');

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendOTPEmail = async (toEmail, otp, type, ipAddress) => {
  try {
    console.log('=== SENDING OTP EMAIL ===');
    console.log('To:', toEmail);
    console.log('OTP:', otp);
    console.log('Type:', type);
    console.log('IP:', ipAddress);

    // Check rate limit
    console.log('🔍 Checking rate limit...');
    try {
      await otpRateLimiter.consume(`${toEmail}:${type}`);
      console.log('✅ Rate limit check passed');
    } catch (rateLimitError) {
      console.log('❌ Rate limit exceeded');
      throw new Error('Too many OTP requests. Please wait before trying again.');
    }

    // Get fresh access token
    console.log('🔑 Getting OAuth2 access token...');
    let accessTokenResponse;
    try {
      accessTokenResponse = await oAuth2Client.getAccessToken();
      console.log('✅ Access token obtained');
    } catch (oauthError) {
      console.error('❌ OAuth2 error:', oauthError);
      throw new Error('Failed to authenticate with email service. Please check OAuth2 configuration.');
    }

    const { token } = accessTokenResponse;
    if (!token) {
      throw new Error('Failed to get OAuth2 access token');
    }

    console.log('📧 Creating email transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: SENDER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: token,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter
    console.log('🔍 Verifying email transporter...');
    try {
      await transporter.verify();
      console.log('✅ Email transporter verified');
    } catch (verifyError) {
      console.error('❌ Email transporter verification failed:', verifyError);
      throw new Error('Email service configuration error');
    }

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

    console.log('📤 Sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);

    return true;
  } catch (error) {
    console.error('❌ SEND EMAIL ERROR:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check OAuth2 credentials.');
    }

    if (error.message && error.message.includes('invalid_grant')) {
      throw new Error('OAuth2 token expired. Please refresh your Gmail credentials.');
    }

    if (error.message && error.message.includes('rate limit')) {
      throw error; // Pass through rate limit errors
    }

    if (error.message && error.message.includes('OAuth2')) {
      throw error; // Pass through OAuth2 errors
    }

    throw new Error('Failed to send OTP. Please try again later.');
  }
};

export default sendOTPEmail;