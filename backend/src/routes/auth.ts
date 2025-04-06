import { Request, Response, Router } from 'express'
import passport from 'passport'
import User from '../models/User'
import { generateToken } from '../utils/jwt'
import {
  AuthenticatedRequest,
  LoginParams,
  SignupParams,
} from '../types/requests'
import { createResponse } from '../utils/createResponse'
import { hashPassword, verifyPassword } from '../utils/passwordUtils'
import '../configs/passport'
import envConfig from '../configs/env'

const router = Router()

router.post(
  '/signup',
  async (req: Request<{}, {}, SignupParams>, res: Response) => {
    const { name, email, password } = req.body
    try {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        res
          .status(400)
          .json(createResponse(false, 'Email address already exists!'))
        return
      }

      const hashedPassword = await hashPassword(password)
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        signup_date: new Date(),
      })
      await newUser.save()

      const token = generateToken(newUser.id)

      res
        .status(201)
        .json(createResponse(true, 'User signed up successfully', { token }))
    } catch (error) {
      console.error(error)
      res.status(500).json(createResponse(false, 'Something went wrong'))
    }
  },
)

router.post(
  '/login',
  async (req: Request<{}, {}, LoginParams>, res: Response) => {
    const { email, password } = req.body
    try {
      const user = await User.findOne({ email })
      if (!user) {
        res.status(404).json(createResponse(false, 'User not found'))
        return
      }

      if (user.lockedUntil && user.lockedUntil > new Date()) {
        res
          .status(403)
          .json(createResponse(false, 'Account is temporarily locked'))
        return
      }

      const isValid = await verifyPassword(password, user.password)

      if (!isValid) {
        user.failedAttempts += 1
        if (user.failedAttempts >= 5) {
          user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000) // Lock for 30 mins
        }
        await user.save()
        res.status(400).json(createResponse(false, 'Invalid credentials'))
        return
      }

      user.failedAttempts = 0
      user.lockedUntil = null
      await user.save()

      const token = generateToken(user.id)
      res.json(createResponse(true, 'User logged in successfully', { token }))
    } catch (error) {
      console.error(error)
      res.status(500).json(createResponse(false, 'Something went wrong'))
    }
  },
)

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }),
)

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/', session: false }),
  (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      res.status(401).json(createResponse(false, 'Authentication failed'))
      return
    }

    const token = generateToken(req.user.id!)

    res.redirect(`${envConfig.clientURL}/login?token=${token}`)
  },
)

export default router
