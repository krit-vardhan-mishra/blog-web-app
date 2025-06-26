import { connect } from 'mongoose';

const connectDB = async () => {
  try {
    await connect('mongodb://localhost:27017/blog_web_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;