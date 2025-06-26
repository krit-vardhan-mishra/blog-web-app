import { Router } from 'express';
const router = Router();
import Blog from '../models/blogModel.js';
import User from '../models/userModel.js';
import authMiddleware from '../middleware/authMiddleware.js'; // You'll create this

// Create a new blog post (protected route)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id; // Get user ID from auth middleware

    // Find the user to get their name for the author field
    const user = await User._findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const newBlog = new Blog({
      title,
      content,
      author: user.name || 'Anonymous', // Use user's name or 'Anonymous'
      userId,
    });

    const blog = await newBlog.save();

    // Add the blog ID to the user's blogs array
    user.blogs.push(blog.id);
    await user.save();

    res.json(blog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all blog posts
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }); // Sort by creation date
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get a single blog post by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    res.json(blog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Update a blog post (protected route)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }

    // Check if the logged-in user is the author of the blog
    if (blog.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;

    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Delete a blog post (protected route)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }

    // Check if the logged-in user is the author of the blog
    if (blog.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await blog.remove(); // Use deleteOne() or deleteMany() in newer Mongoose versions

    // Remove the blog ID from the user's blogs array
    const user = await User._findById(req.user.id);
    user.blogs = user.blogs.filter(blogId => blogId.toString() !== req.params.id);
    await user.save();

    res.json({ msg: 'Blog post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    res.status(500).send('Server Error');
  }
});

export default router;
