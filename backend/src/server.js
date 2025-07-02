import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import usersRoutes from './routes/usersRoutes.js'
import blogsRoutes from './routes/blogsRoutes.js'
import dotenv from 'dotenv';
import User from './models/User.js';
import jwt from 'jsonwebtoken';


dotenv.config();
await connectDB().then(() => console.log("Database connected")).catch(err => console.error("Database connection error:", err));

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", usersRoutes);
app.use("/api/blogs", blogsRoutes)

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found, please check details or sign up' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        about: user.about
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
