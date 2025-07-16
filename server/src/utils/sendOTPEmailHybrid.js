import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { otpRateLimiter } from '../middleware/rateLimiter.js';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID, 
  CLIENT_SECRET, 
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Try OAuth2 first, fallback to App Password
const sendOTPEmail = async (toEmail, otp, type, ipAddress) => {
  try {
    console.log('=== SENDING OTP EMAIL (HYBRID) ===');
    
    // Check rate limit
    await otpRateLimiter.consume(`${toEmail}:${type}`);

    let transporter;
    let authMethod = 'unknown';

    // Try OAuth2 first if credentials are available
    if (CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN) {
      try {
        console.log('🔑 Trying OAuth2 authentication...');
        const { token } = await oAuth2Client.getAccessToken();
        
        if (token) {
          transporter = nodemailer.createTransporter({
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
          
          await transporter.verify();
          authMethod = 'OAuth2';
          console.log('✅ OAuth2 authentication successful');
        }
      } catch (oauthError) {
        console.log('❌ OAuth2 failed, trying App Password...', oauthError.message);
        transporter = null;
      }
    }

    // Fallback to App Password if OAuth2 failed or unavailable
    if (!transporter && GMAIL_APP_PASSWORD) {
      try {
        console.log('🔑 Trying App Password authentication...');
        transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: SENDER_EMAIL,
            pass: GMAIL_APP_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        
        await transporter.verify();
        authMethod = 'App Password';
        console.log('✅ App Password authentication successful');
      } catch (appPasswordError) {
        console.log('❌ App Password failed:', appPasswordError.message);
        throw new Error('All email authentication methods failed');
      }
    }

    if (!transporter) {
      throw new Error('No email authentication method available');
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

    console.log(`📤 Sending email using ${authMethod}...`);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ HYBRID EMAIL ERROR:', error);
    
    if (error.message.includes('rate limit')) {
      throw error;
    }
    
    throw new Error('Failed to send OTP. Please try again later.');
  }
};

export default sendOTPEmail;