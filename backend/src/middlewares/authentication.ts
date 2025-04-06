import { Request, Response, NextFunction } from 'express'
import { createResponse } from '../utils/createResponse'
import { verifyToken } from '../utils/jwt'
import { AuthenticatedRequest } from '../types/requests'
import { AuthenticatedSocket, User } from '../types/common'

export const verifyJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    res
      .status(401)
      .json(createResponse(false, 'Access denied. No token provided.'))
    return
  }

  try {
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json(createResponse(false, 'Invalid or expired token'))
  }
}

export const verifyJWTSocket = (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void,
) => {
  const token =
    socket.handshake.auth.token ||
    socket.handshake.headers['authorization']?.split(' ')[1]

  if (!token) {
    return next(new Error('No token provided.'))
  }

  try {
    const decodedToken = verifyToken(token)

    socket.user = decodedToken

    next()
  } catch (error) {
    next(new Error('Authentication error: invalid token'))
  }
}
