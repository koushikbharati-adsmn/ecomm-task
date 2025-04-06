import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import corsOptions from './configs/cors'
import { AuthenticatedSocket } from './types/common'
import { verifyJWTSocket } from './middlewares/authentication'
import { Order } from './models/Order'

let activeUsers = new Set<string>()

export let io: SocketIOServer

export const initializeSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: corsOptions,
  })

  io.use(verifyJWTSocket)

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const user = socket.user
    if (!user || !user.id) return

    activeUsers.add(user.id.toString())

    io.emit('activeUsers', activeUsers.size)

    socket.on('getAnalytics', async () => {
      socket.emit('activeUsers', activeUsers.size)
      socket.emit('totalOrders', await Order.countDocuments())
    })

    socket.on('disconnect', () => {
      activeUsers.delete(user?.id || '')
      io.emit('activeUsers', activeUsers.size)
      console.log(`User disconnected: ${user.id} | Active: ${activeUsers.size}`)
    })
  })
}
