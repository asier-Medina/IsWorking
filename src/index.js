import express from 'express'
import dotenv from 'dotenv'
import sequelize from './config/postgres.js'
import connectMongo from './config/mongo.js'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.routes.js'
const app = express()


dotenv.config()
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.get('/health', (req, res) => res.json({ status: 'ok' }))

const start = async () => {
  await sequelize.authenticate()
  console.log('PostgreSQL conectado')

  await connectMongo()
  console.log('MongoDB conectado')

  app.listen(process.env.PORT || 3000, () =>
    console.log(`Servidor en puerto ${process.env.PORT || 3000}`)
  )
}

start()