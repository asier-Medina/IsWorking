import { DataTypes } from 'sequelize'
import sequelize from '../../config/postgres.js'

const TimeRecord = sequelize.define('TimeRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('entry', 'break_start', 'break_end', 'exit'),
    allowNull: false,
  },
  mode: {
    type: DataTypes.ENUM('office', 'remote'),
    defaultValue: 'office',
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  latitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
  },
  accuracy: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
  },
  synced: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'time_records',
  timestamps: false,
  underscored: true,
})

export default TimeRecord