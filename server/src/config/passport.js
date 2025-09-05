import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { GOOGLE_AUTH } from '../utils/constants.js';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_AUTH.CLIENT_ID,
    clientSecret: GOOGLE_AUTH.CLIENT_SECRET,
    callbackURL: GOOGLE_AUTH.CALLBACK_URL,
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
        // Generate unique username from email
        let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
        let username = baseUsername;
        let counter = 1;
        
        while (await User.findOne({ username })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }
        
        user = await User.create({
          name: profile.displayName,
          username,
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