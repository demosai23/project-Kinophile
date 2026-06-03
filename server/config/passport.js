import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) return done(null, user);

        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          user.googleId = profile.id;
          if (!user.avatar) user.avatar = profile.photos[0]?.value || '';
          await user.save();
          return done(null, user);
        }

        const username = profile.displayName.toLowerCase().replace(/\s+/g, '') +
          Math.floor(Math.random() * 1000);

        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          displayName: profile.displayName,
          username,
          avatar: profile.photos[0]?.value || '',
          isVerified: true,
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;