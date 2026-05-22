import ShiftTemplate from '../models/postgres/ShiftTemplate.js';

export const getShiftTemplates = async (req, res) => {
  try {
    const templates = await ShiftTemplate.findAll({
      order: [['id', 'ASC']]
    });
    res.status(200).json(templates);
  } catch (error) {
    console.error('getShiftTemplates error:', error);
    res.status(500).json({ error: 'Error al obtener las plantillas' });
  }
};

export const createShiftTemplate = async (req, res) => {
  try {
    const { company_id, name, type, start_time, end_time, break_start, break_end, has_break } = req.body;

    const newTemplate = await ShiftTemplate.create({
      company_id,
      name,
      type,
      start_time,
      end_time,
      break_start,
      break_end,
      has_break
    });

    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('createShiftTemplate error:', error);
    res.status(400).json({ error: 'Error al crear la plantilla' });
  }
};