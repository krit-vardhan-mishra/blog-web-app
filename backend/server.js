import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { UserService } from './services/userService.js';
import { BlogService } from './services/blogService.js';
import jwt from 'jsonwebtoken';
import User from './models/mongoUser.js';
import dotenv from 'dotenv';

dotenv.config();

await connectDB()
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection error:', err));
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired', expired: true });
      }
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// --- API Routes for Users ---
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- API Routes for Blogs ---
app.get('/api/blogs', authenticateToken, async (req, res) => {
  try {
    const blogs = await BlogService.getAllBlogs();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/blogs/:id', authenticateToken, async (req, res) => {
  try {
    const blog = await BlogService.getBlogByIdWithAuthor(req.params.id);
    if (blog) {
      res.json(blog);
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/blogs', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const authorIdFromToken = req.user.id;

    if (!authorIdFromToken) {
      return res.status(400).json({ message: 'Authenticated user ID not found in token.' });
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const blog = await BlogService.createBlog({
      title,
      content,
      authorId: authorIdFromToken,
    });
    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/blogs/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const blogId = req.params.id;
    const userId = req.user.id;

    const blog = await BlogService.getBlogById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    let authorId = typeof blog.author === 'object' ? blog.author._id.toString() : blog.author.toString();
    if (authorId !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    let updated = false;
    if (title !== undefined) {
      updated = await BlogService.updateBlogTitle(blogId, title) || updated;
    }
    if (content !== undefined) {
      updated = await BlogService.updateBlogContent(blogId, content) || updated;
    }

    if (updated) {
      const updatedBlog = await BlogService.getBlogByIdWithAuthor(blogId);
      res.json(updatedBlog);
    } else {
      res.status(400).json({ message: 'No valid updates provided' });
    }
  } catch (error) {
    console.error('PUT /api/blogs/:id error:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/blogs/:id', authenticateToken, async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.id;

    const blog = await BlogService.getBlogById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    if (blog.author.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const success = await BlogService.deleteBlog(blogId);
    if (success) {
      res.json({ message: 'Blog deleted successfully' });
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/blogs/increment-view/:id', authenticateToken, async (req, res) => {
  try {
    const blog = await BlogService.incrementBlogView(req.params.id);
    res.status(200).json({ message: 'View incremented successfully', blog });
  } catch (error) {
    console.error('Error incrementing blog view:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, age } = req.body;
    console.log('Register request body:', req.body);

    if (!email || !password || !firstName || !lastName || !age) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists, please login' });
    }

    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password,
      age: parseInt(age),
    });

    const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, age: user.age },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching profile for userId from token:', req.user.id);
    const user = await User.findById(req.user.id).select('name email age');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: { id: user._id, name: user.name, email: user.email, age: user.age } });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

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
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});