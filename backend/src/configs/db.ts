import mongoose from 'mongoose'
import envConfig from './env'

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(envConfig.mongoURI)
    console.log(`MongoDB connected successfully: ${connection.connection.host}`)
  } catch (error) {
    console.error('Error occurred while connecting to MongoDB', error)
    process.exit(1)
  }
}

export default connectDB
