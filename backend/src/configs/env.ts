import dotenv from 'dotenv'

dotenv.config()

interface EnvConfig {
  port: number
  nodeEnv: string
  mongoURI: string
  jwtSecret: string
  googleClientID: string
  googleClientSecret: string
  clientURL: string
}

const envConfig: EnvConfig = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoURI: process.env.MONGO_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  googleClientID: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  clientURL: process.env.CLIENT_URL!,
}

export default envConfig
