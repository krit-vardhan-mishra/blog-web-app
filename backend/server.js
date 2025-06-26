import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors'; // Assuming you need CORS for frontend communication
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js'; // You'll create this

const app = express();

// Middleware
app.use(json()); // Parse incoming JSON requests
app.use(cors()); // Enable CORS if needed

// MongoDB Connection
connect('mongodb://localhost:27017/blogapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes); // Mount blog routes

const PORT = process.env.PORT || 5000; // Use environment variable for port

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
