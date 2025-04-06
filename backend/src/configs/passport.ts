import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User'
import envConfig from './env'

passport.use(
  new GoogleStrategy(
    {
      clientID: envConfig.googleClientID,
      clientSecret: envConfig.googleClientSecret,
      callbackURL: '/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails?.[0].value })

        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails?.[0].value,
            password: '',
            role: 'user',
            signup_date: new Date(),
          })
          await user.save()
        }

        done(null, user)
      } catch (error) {
        done(error, false)
      }
    },
  ),
)

passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})
