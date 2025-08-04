import express from 'express';
import usersRoutes from './routes/usersRoutes.js';
import blogsRoutes from './routes/blogsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import initMiddleware from './middleware/initMiddleware.js';
import './config/passport.js';
import connectDB from './config/db.js';
import cron from 'node-cron';
import User from './models/User.js';
import OTP from './models/OTP.js';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVER, GOOGLE_AUTH } from './utils/constants.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { PORT, NODE_ENV } = SERVER;
const { CLIENT_URL } = GOOGLE_AUTH;

app.set('trust proxy', true);

await connectDB()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

initMiddleware(app); 

app.use(passport.initialize());
app.use(passport.session());

cron.schedule('0 0 * * *', async () => {
  try {
    await OTP.deleteMany({
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    await User.updateMany(
      { blockExpires: { $lt: new Date() } },
      { $set: { loginAttempts: 0, blockExpires: null } }
    );
    console.log('Daily cleanup completed');
  } catch (err) {
    console.error('Cron job error:', err);
  }
});

// API routes
app.use('/api/users', usersRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', otpRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    clientUrl: CLIENT_URL,
    nodeEnv: NODE_ENV,
    origin: req.get('origin'),
    host: req.get('host')
  });
});

if (NODE_ENV === 'PRODUCTION') {
  app.use(express.static(path.join(__dirname, '..', '..', 'client', 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'client', 'dist', 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error('Global error:', err);

  if (err.oauthError) {
    return res.redirect(`${CLIENT_URL}/login?error=oauth_${err.oauthError.code}`);
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: NODE_ENV === 'DEVELOPMENT' ? err.message : undefined
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  Server running in ${NODE_ENV} mode
  API: http://localhost:${PORT}
  Client: ${CLIENT_URL}
  Time: ${new Date().toLocaleTimeString()}
  `);
});