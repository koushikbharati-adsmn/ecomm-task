import { Request, Response, Router } from 'express'
import User from '../models/User'
import { createResponse } from '../utils/createResponse'
import mongoose from 'mongoose'
import {
  AuthenticatedRequest,
  FetchUsersParams,
  UpdateUserParams,
} from '../types/requests'

const router = Router()

router.get(
  '/',
  async (req: Request<{}, {}, FetchUsersParams>, res: Response) => {
    try {
      const search = req.query.search
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 10
      const skip = (page - 1) * limit

      const query = search
        ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
            ],
          }
        : {}

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .skip(skip)
          .limit(limit)
          .sort({ signup_date: -1 }),
        User.countDocuments(query),
      ])

      res.status(200).json(
        createResponse(true, 'Users fetched successfully', {
          data: users,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        }),
      )
    } catch (error) {
      console.error('Error fetching users:', error)
      res.status(500).json(createResponse(false, 'Error fetching users'))
    }
  },
)

router.get('/me', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json(createResponse(false, 'Unauthorized'))
      return
    }

    const user = await User.findById(userId).select('-password')

    if (!user) {
      res.status(404).json(createResponse(false, 'User not found'))
      return
    }

    res
      .status(200)
      .json(createResponse(true, 'User profile fetched successfully', user))
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res
      .status(500)
      .json(createResponse(false, 'Something went wrong while fetching user'))
  }
})

router.patch(
  '/:id',
  async (req: Request<{ id: string }, {}, UpdateUserParams>, res: Response) => {
    try {
      const userId = req.params.id

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json(createResponse(false, 'Invalid user ID'))
        return
      }

      const { name, email, role } = req.body

      await User.findByIdAndUpdate(
        userId,
        { name, email, role },
        {
          new: true,
          runValidators: true,
        },
      ).select('-password')

      res.status(200).json(createResponse(true, 'User updated successfully'))
    } catch (err) {
      console.error('Error updating user:', err)
      res.status(500).json(createResponse(false, 'Error updating user'))
    }
  },
)

export default router
