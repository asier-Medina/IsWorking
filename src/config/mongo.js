//configuración de la conexión a MongoDB usando Mongoose

import mongoose from 'mongoose'

const connectMongo = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)

    console.log(`MongoDB conectado: ${conn.connection.host}`)
  } catch (error) {
    console.error('Error MongoDB:', error.message)
    process.exit(1)
  }
}

export default connectMongo