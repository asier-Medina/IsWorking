import { Op } from 'sequelize'
import Schedule from '../models/postgres/Schedule.js'
import User from '../models/postgres/User.js'
import ShiftTemplate from '../models/postgres/ShiftTemplate.js'

export const getSchedulesService = async ({ userId, startDate, endDate }, companyId, role) => {
  const where = {}

  if (role === 'employee') {
    where.user_id = userId
  } else if (role === 'admin') {
    // Solo schedules de empleados de su empresa
    const companyUsers = await User.findAll({
      where: { company_id: companyId },
      attributes: ['id']
    })
    where.user_id = companyUsers.map(u => u.id)
  }

  if (startDate && endDate) {
    where.work_date = { [Op.between]: [startDate, endDate] }
  }

  return Schedule.findAll({ where, order: [['work_date', 'ASC']] })
}

export const assignShiftService = async ({ user_id, shift_template_id, work_date, created_by }) => {
  return Schedule.create({
    user_id,
    shift_template_id,
    work_date,
    status: 'assigned',
    created_by
  });
};

export const updateScheduleStatusService = async (id, status) => {
  const schedule = await Schedule.findByPk(id);
  if (!schedule) return null;

  await schedule.update({ status });
  return schedule;
};

