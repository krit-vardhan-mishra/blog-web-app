import pkg from 'jsonwebtoken';
const { verify } = pkg;

export default function(req, res, next) { 
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = verify(token, 'blog_web_app'); // Use the same secret as in authRoutes

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
