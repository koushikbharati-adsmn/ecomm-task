import express from 'express'
import cors from 'cors'
import passport from 'passport'

import corsOptions from './configs/cors'
import { verifyJWT } from './middlewares/authentication'

import authRouter from './routes/auth'
import productRouter from './routes/products'
import ordersRouter from './routes/orders'
import usersRouter from './routes/users'

const app = express()

app.use(cors(corsOptions))

app.use(express.json())

app.use(passport.initialize())

app.use('/api/auth', authRouter)
app.use('/api/products', verifyJWT, productRouter)
app.use('/api/orders', verifyJWT, ordersRouter)
app.use('/api/users', verifyJWT, usersRouter)

app.get('/', (_, res) => {
  res.send('Hello, TypeScript + Node.js + Express!')
})

export default app
