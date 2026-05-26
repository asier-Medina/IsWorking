import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

dotenv.config()

import sequelize from './config/postgres.js'
import connectMongo from './config/mongo.js'
import cors from 'cors'

import authRouter from './routes/auth.routes.js'
import companyRouter from './routes/company.routes.js'
import userRouter from './routes/user.routes.js'
import recordsRouter from './routes/records.routes.js'
import scheduleRouter from './routes/schedules.routes.js'
import shiftTemplateRouter from './routes/shifts.routes.js'

import { setupAssociations } from './models/postgres/associations.js'
import { notFound, errorHandler } from './middlewares/errorHandler.js'
import logsrouter from './routes/logs.routes.js'


const app = express()

setupAssociations()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true  // imprescindible para que las cookies viajen
}))
app.use(express.json())
app.use(cookieParser())


app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRouter)
app.use('/api/companies', companyRouter)
app.use('/api/users', userRouter)
app.use('/api/records', recordsRouter)
app.use('/api/schedules', scheduleRouter)
app.use('/api/shift-templates', shiftTemplateRouter)
app.use('/api/logs', logsrouter)

app.use(notFound)
app.use(errorHandler)

const start = async () => {
  try {
    await sequelize.authenticate()
    await connectMongo()

    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`Servidor listo en http://localhost:${port}`))
  } catch (error) {
    console.error('Error arrancando servidor:', error.message)
    process.exit(1)
  }
}

start()