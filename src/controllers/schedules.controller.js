import {
  getSchedulesService,
  assignShiftService,
  updateScheduleStatusService
} from '../services/schedules.service.js';

export const getSchedules = async (req, res) => {
  try {
    const schedules = await getSchedulesService(req.query);
    res.status(200).json(schedules);
  } catch (error) {
    console.error('getSchedules error:', error);
    res.status(500).json({ error: 'Error al obtener los horarios' });
  }
};

export const assignShift = async (req, res) => {
  try {
    const newSchedule = await assignShiftService(req.body);
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

    const schedule = await updateScheduleStatusService(id, status);
    if (!schedule) return res.status(404).json({ error: 'Horario no encontrado' });

    res.status(200).json(schedule);
  } catch (error) {
    console.error('updateScheduleStatus error:', error);
    res.status(400).json({ error: 'Error al cambiar el estado del horario' });
  }
};