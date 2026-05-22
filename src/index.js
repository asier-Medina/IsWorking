import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

dotenv.config()

import sequelize from './config/postgres.js'
import connectMongo from './config/mongo.js'

import authRouter from './routes/auth.routes.js'
import companyRouter from './routes/company.routes.js'
import userRouter from './routes/user.routes.js'
import recordsRouter from './routes/records.routes.js'
import scheduleRouter from './routes/schedules.routes.js'
import shiftTemplateRouter from './routes/shifts.routes.js'

import { setupAssociations } from './models/postgres/associations.js'
import { notFound, errorHandler } from './middlewares/errorHandler.js'

const app = express()

setupAssociations()

app.use(express.json())
app.use(cookieParser())

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRouter)
app.use('/api/companies', companyRouter)
app.use('/api/users', userRouter)
app.use('/api/records', recordsRouter)
app.use('/api/schedules', scheduleRouter)
app.use('/api/shift-templates', shiftTemplateRouter)

app.use(notFound)
app.use(errorHandler)

const start = async () => {
  try {
    await sequelize.authenticate()
    console.log('PostgreSQL conectado')

    await connectMongo()
    console.log('MongoDB conectado')

    app.listen(process.env.PORT || 3000, () =>
      console.log(`Servidor en puerto ${process.env.PORT || 3000}`)
    )
  } catch (error) {
    console.error('Error arrancando servidor:', error.message)
    process.exit(1)
  }
}

start()