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
import passport from 'passport';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', true);

await connectDB()
  .then(() => console.log("Database connected"))
  .catch(err => console.error("Database connection error:", err));

initMiddleware(app);

app.use(passport.initialize());
app.use(passport.session());

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

app.use((err, _, res, req) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((err, _, res, req) => {
  console.error('Global error handler:', err);
  
  if (err.oauthError) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_${err.oauthError.code}`);
  }

  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.debug(`Server running at Date: ${new Date().toLocaleTimeString()}`);
});