import { DataTypes } from 'sequelize';
import sequelize from '../../config/postgres.js';

const ShiftTemplate = sequelize.define('ShiftTemplate', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  company_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(50), allowNull: false },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['morning', 'afternoon', 'split']]
    }
  },
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false },
  break_start: { type: DataTypes.TIME, allowNull: true },
  break_end: { type: DataTypes.TIME, allowNull: true },
  has_break: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'shift_templates',
  timestamps: false
});

export default ShiftTemplate;