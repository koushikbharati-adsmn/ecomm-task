import jwt from 'jsonwebtoken'
import envConfig from '../configs/env'

export const generateToken = (id: string) => {
  return jwt.sign({ id }, envConfig.jwtSecret, {
    expiresIn: '1h',
  })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, envConfig.jwtSecret) as {
    id: string
  }
}
