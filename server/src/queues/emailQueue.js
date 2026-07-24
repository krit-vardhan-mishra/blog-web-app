import { Queue } from 'bullmq';
import { checkRedisHealth } from '../config/redis.js';
import sendOTPEmail from '../utils/sendOTPEmail.js';

let emailQueue = null;

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);

const getEmailQueue = () => {
  if (!emailQueue && checkRedisHealth()) {
    try {
      emailQueue = new Queue('emailQueue', {
        connection: {
          host: REDIS_HOST,
          port: REDIS_PORT
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          },
          removeOnComplete: true,
          removeOnFail: 100
        }
      });
    } catch (err) {
      console.warn('⚠️ BullMQ Email Queue connection warning:', err.message);
    }
  }
  return emailQueue;
};

export const queueOTPEmail = async (toEmail, otp, type, ipAddress) => {
  const queue = getEmailQueue();
  if (checkRedisHealth() && queue) {
    try {
      await queue.add('send-otp', { toEmail, otp, type, ipAddress });
      console.log(`✉️ Queued OTP email to ${toEmail} via BullMQ`);
      return { status: 'queued' };
    } catch (queueErr) {
      console.warn('⚠️ BullMQ enqueue failed, executing non-blocking background email:', queueErr.message);
    }
  }

  // Graceful Fallback: Non-blocking background dispatch
  setImmediate(async () => {
    try {
      await sendOTPEmail(toEmail, otp, type, ipAddress);
      console.log(`✉️ Sent OTP email to ${toEmail} via direct background fallback`);
    } catch (err) {
      console.error(`❌ Background email fallback error for ${toEmail}:`, err.message);
    }
  });

  return { status: 'background_fallback' };
};

export default getEmailQueue;
