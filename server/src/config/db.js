import { connect } from 'mongoose';
import { DATABASE } from '../utils/constants.js';

const connectDB = async () => {
  try {
    await connect(DATABASE.MONGODB_URI)
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;