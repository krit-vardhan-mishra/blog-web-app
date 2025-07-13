import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 

const authenticateToken = async (req, res, next) => {
  console.log('Auth middleware: Request received.');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('Auth middleware: No token provided.');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      console.error('Auth middleware: Token verification failed:', err.message);
      return res.sendStatus(403);
    }
    console.log('Auth middleware: Token verified. User ID:', user.id);

    try {
        const foundUser = await User.findById(user.id);
        if (!foundUser) {
            console.error('Auth middleware: User not found in DB for ID:', user.id);
            return res.status(404).json({ message: 'User not found.' });
        }
        req.user = foundUser;
        console.log('Auth middleware: User attached to request. Proceeding.');
        next();
    } catch (dbError) {
        console.error('Auth middleware: DB error fetching user:', dbError.message);
        return res.status(500).json({ message: 'Internal server error during authentication.' });
    }
  });
};

export default authenticateToken;