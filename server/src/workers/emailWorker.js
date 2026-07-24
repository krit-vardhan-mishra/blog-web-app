import { Worker } from 'bullmq';
import sendOTPEmail from '../utils/sendOTPEmail.js';
import { checkRedisHealth } from '../config/redis.js';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);

let emailWorker = null;

export const initEmailWorker = () => {
  if (!checkRedisHealth()) {
    console.log('ℹ️ Redis offline: BullMQ Email Worker standing by in fallback mode');
    return null;
  }

  try {
    emailWorker = new Worker(
      'emailQueue',
      async (job) => {
        const { toEmail, otp, type, ipAddress } = job.data;
        console.log(`🔨 Processing background email job #${job.id} for ${toEmail}...`);
        await sendOTPEmail(toEmail, otp, type, ipAddress);
        return { delivered: true, recipient: toEmail };
      },
      {
        connection: {
          host: REDIS_HOST,
          port: REDIS_PORT
        },
        concurrency: 5
      }
    );

    emailWorker.on('completed', (job) => {
      console.log(`✅ Email job #${job.id} completed successfully`);
    });

    emailWorker.on('failed', (job, err) => {
      console.error(`❌ Email job #${job?.id} failed:`, err.message);
    });

    console.log('⚙️ BullMQ Email Worker service initialized (Concurrency: 5)');
    return emailWorker;
  } catch (err) {
    console.warn('⚠️ Could not initialize BullMQ Email Worker:', err.message);
    return null;
  }
};

export default initEmailWorker;
