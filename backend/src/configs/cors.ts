import { CorsOptions } from 'cors'

const whitelist = ['http://localhost:5173']

const corsOptions: CorsOptions = {
  origin: whitelist,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}

export default corsOptions
