import { DataTypes } from 'sequelize';
import sequelize from '../../config/postgres.js';

const Schedule = sequelize.define('Schedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  shift_template_id: { type: DataTypes.INTEGER, allowNull: true },
  work_date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.STRING(20), defaultValue: 'assigned' },
  created_by: { type: DataTypes.INTEGER, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'schedules',
  timestamps: false
});

export default Schedule;