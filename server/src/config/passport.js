import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    proxy: true,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {      
      if (!profile.emails || !profile.emails[0]) {
        throw new Error('No email found in Google profile');
      }

      const email = profile.emails[0].value;
      
      let user = await User.findOne({ email });
      
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email,
          isEmailVerified: true,
          authMethod: 'google'
        });
        console.debug('New user created via Google OAuth:', user);
      } else {
        console.debug('Existing user found via Google OAuth:', user);
      }
      
      return done(null, user);
    } catch (err) {
      console.error('Google OAuth error:', err);
      return done(err, null, { message: 'Error processing Google authentication' });
    }
  }
));

// Enhanced serialization
passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    authMethod: user.authMethod
  });
});

// Enhanced deserialization
passport.deserializeUser(async (obj, done) => {
  try {
    const user = await User.findById(obj.id);
    if (!user) {
      return done(new Error('User not found'));
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
});