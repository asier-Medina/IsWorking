import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()
console.log('PUERTO DB:', process.env.DB_PORT)

/*
   Instancia de Sequelize configurada con las variables de entorno.
   Utiliza PostgreSQL como dialecto y desactiva el logging de queries.
*/
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5440,
        dialect: 'postgres',
        logging: false
    }
)

export default sequelize
