import { connect } from 'mongoose';
import dns from 'dns';
import { DATABASE } from '../utils/constants.js';

// Configure reliable DNS servers (Google / Cloudflare) to resolve MongoDB SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (dnsErr) {
  console.warn('⚠️ Custom DNS set warning:', dnsErr.message);
}

const connectDB = async () => {
  try {
    await connect(DATABASE.MONGODB_URI, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;