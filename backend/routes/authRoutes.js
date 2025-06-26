import { Router } from 'express';
const router = Router();
import User from '../models/userModel.js';
import { genSalt, hash, compare } from 'bcrypt';
import pkg from 'jsonwebtoken';
const { sign } = pkg;

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, age } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    // Create new user
    user = new User({
      name,
      age,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT token (for authentication)
    const payload = {
      user: {
        id: user.id,
      },
    };

    sign(
      payload,
      'blog_web_app', // Replace with a strong secret key (use environment variable)
      { expiresIn: '1h' }, // Token expiration
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    sign(
      payload,
      'blog_web_app', // Replace with a strong secret key
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
