import Schedule from '../models/Schedule.js';

export const getSchedules = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    let query = {};

    if (employeeId) query.employeeId = employeeId;

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const schedules = await Schedule.find(query)
      .populate('shiftTemplateId')
      .sort({ date: 1 });

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los horarios' });
  }
};

export const assignShift = async (req, res) => {
  try {
    const { employeeId, shiftTemplateId, date } = req.body;
    const newSchedule = new Schedule({
      employeeId,
      shiftTemplateId,
      date: new Date(date)
    });
    await newSchedule.save();
    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(400).json({ error: 'Error al asignar el turno o ya tiene un turno ese día' });
  }
};

export const updateScheduleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedSchedule) return res.status(404).json({ error: 'Horario no encontrado' });
    res.status(200).json(updatedSchedule);
  } catch (error) {
    res.status(400).json({ error: 'Error al cambiar el estado del horario' });
  }
};