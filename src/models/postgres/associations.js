import Company from './Company.js'
import User from './User.js'

export const setupAssociations = () => {
  // Company -> Users
  Company.hasMany(User, {
    foreignKey: 'company_id',
    as: 'users',
    onDelete: 'CASCADE'
  })

  User.belongsTo(Company, {
    foreignKey: 'company_id',
    as: 'company'
  })

  // Company -> ShiftTemplates
  Company.hasMany(ShiftTemplate, {
    foreignKey: 'company_id',
    as: 'shift_templates',
    onDelete: 'CASCADE'
  })

  ShiftTemplate.belongsTo(Company, {
    foreignKey: 'company_id',
    as: 'company'
  })

  // User -> Schedules
  User.hasMany(Schedule, {
    foreignKey: 'user_id',
    as: 'schedules',
    onDelete: 'CASCADE'
  })

  Schedule.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  })

  // ShiftTemplate -> Schedules
  ShiftTemplate.hasMany(Schedule, {
    foreignKey: 'shift_template_id',
    as: 'schedules'
  })

  Schedule.belongsTo(ShiftTemplate, {
    foreignKey: 'shift_template_id',
    as: 'shift_template'
  })

  // User creador -> Schedules
  User.hasMany(Schedule, {
    foreignKey: 'created_by',
    as: 'created_schedules'
  })

  Schedule.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
  })

  // User -> TimeRecords
  User.hasMany(TimeRecord, {
    foreignKey: 'user_id',
    as: 'time_records',
    onDelete: 'CASCADE'
  })

  TimeRecord.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  })

  // Schedule -> TimeRecords
  Schedule.hasMany(TimeRecord, {
    foreignKey: 'schedule_id',
    as: 'time_records'
  })

  TimeRecord.belongsTo(Schedule, {
    foreignKey: 'schedule_id',
    as: 'schedule'
  })

}