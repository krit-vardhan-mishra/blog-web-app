import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router(); 

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.redirect(`${process.env.CLIENT_URL}/google-auth?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
  }
);

export default router;