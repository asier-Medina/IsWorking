import { Op } from 'sequelize';
import Schedule from '../models/postgres/Schedule.js';

export const getSchedules = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const where = {};

    if (userId) where.user_id = userId;

    if (startDate && endDate) {
      where.work_date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const schedules = await Schedule.findAll({
      where,
      order: [['work_date', 'ASC']]
    });

    res.status(200).json(schedules);
  } catch (error) {
    console.error('getSchedules error:', error);
    res.status(500).json({ error: 'Error al obtener los horarios' });
  }
};

export const assignShift = async (req, res) => {
  try {
    const { user_id, shift_template_id, work_date, created_by } = req.body;

    const newSchedule = await Schedule.create({
      user_id,
      shift_template_id,
      work_date,
      status: 'assigned',
      created_by
    });

    res.status(201).json(newSchedule);
  } catch (error) {
    console.error('assignShift error:', error);
    res.status(400).json({ error: 'Error al asignar el turno o ya tiene un turno ese día' });
  }
};

export const updateScheduleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const schedule = await Schedule.findByPk(id);
    if (!schedule) return res.status(404).json({ error: 'Horario no encontrado' });

    await schedule.update({ status });
    res.status(200).json(schedule);
  } catch (error) {
    console.error('updateScheduleStatus error:', error);
    res.status(400).json({ error: 'Error al cambiar el estado del horario' });
  }
};