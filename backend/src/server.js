import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import usersRoutes from './routes/usersRoutes.js'
import blogsRoutes from './routes/blogsRoutes.js'
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';

dotenv.config();
await connectDB().then(() => console.log("Database connected")).catch(err => console.error("Database connection error:", err));

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", usersRoutes);
app.use("/api/blogs", blogsRoutes)
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
