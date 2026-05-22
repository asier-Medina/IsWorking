import express from 'express'
import dotenv from 'dotenv'
import sequelize from './config/postgres.js'
import connectMongo from './config/mongo.js'

dotenv.config()
const app = express()
app.use(express.json())

// Aquí cada persona importará sus rutas:
// import companiesRouter from './routes/companies.routes.js'
// app.use('/api/companies', companiesRouter)

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