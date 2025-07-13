import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import usersRoutes from './routes/usersRoutes.js';
import blogsRoutes from './routes/blogsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import initMiddleware from './middleware/initMiddleware.js';
import './config/passport.js';
import cron from 'node-cron';
import User from './models/User.js';
import OTP from './models/OTP.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

await connectDB()
  .then(() => console.log("Database connected"))
  .catch(err => console.error("Database connection error:", err));

initMiddleware(app);

cron.schedule('0 0 * * *', async () => {
  await OTP.deleteMany({ 
    createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
  });
  
  await User.updateMany(
    { blockExpires: { $lt: new Date() } },
    { $set: { loginAttempts: 0, blockExpires: null } }
  );
});

app.use("/api/users", usersRoutes);
app.use("/api/blogs", blogsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth", otpRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
