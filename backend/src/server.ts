import http from 'http'
import app from './app'
import connectDB from './configs/db'
import envConfig from './configs/env'
import { initializeSocket } from './socket'

connectDB()

const server = http.createServer(app)

initializeSocket(server)

server.listen(envConfig.port, () => {
  console.log(`Server is running on http://localhost:${envConfig.port}`)
})
