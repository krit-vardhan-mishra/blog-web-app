import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import usersRoutes from './routes/usersRoutes.js';
import blogsRoutes from './routes/blogsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import initMiddleware from './middlewares/initMiddleware.js';
import './config/passport.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

await connectDB()
  .then(() => console.log("Database connected"))
  .catch(err => console.error("Database connection error:", err));

initMiddleware(app);

app.use("/api/users", usersRoutes);
app.use("/api/blogs", blogsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth", otpRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
