import { DataTypes } from 'sequelize'
import sequelize from '../../config/postgres.js'

const User = sequelize.define('User', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  company_id:    { type: DataTypes.INTEGER, allowNull: false },
  name:          { type: DataTypes.STRING(100), allowNull: false },
  email:         { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role:          { type: DataTypes.STRING(20), defaultValue: 'employee' },
  remote_allowed:{ type: DataTypes.BOOLEAN, defaultValue: false },
  active:        { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
})

export default User