import mongoose, { Schema } from 'mongoose'

export interface IUser {
  _id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
  signup_date: Date
  failedAttempts: number
  lockedUntil: Date | null
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: false,
  },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  signup_date: { type: Date, default: Date.now },
  failedAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null },
})

const User = mongoose.model<IUser>('User', UserSchema)

export default User
