import { Op } from 'sequelize';
import Schedule from '../models/postgres/Schedule.js';

export const getSchedulesService = async ({ userId, startDate, endDate }) => {
  const where = {};

  if (userId) where.user_id = userId;

  if (startDate && endDate) {
    where.work_date = {
      [Op.between]: [startDate, endDate]
    };
  }

  return Schedule.findAll({
    where,
    order: [['work_date', 'ASC']]
  });
};

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