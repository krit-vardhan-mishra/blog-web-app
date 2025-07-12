import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(404).json({ message: 'User not found, please check details or sign up' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        about: user.about,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, age } = req.body;

    if (!email || !password || !firstName || !lastName || !age)
      return res.status(400).json({ message: 'All fields are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: 'User already exists, please login' });

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
};

export const verifyPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ message: 'Password is required' });

    const user = await User.findById(userId).select('+password');
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Incorrect password' });

    res.status(200).json({ success: true, message: 'Password verified' });
  } catch (error) {
    console.error('Password verification error:', error);
    res.status(500).json({ message: error.message });
  }
};
