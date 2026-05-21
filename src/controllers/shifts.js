const ShiftTemplate = require('../models/ShiftTemplate');

//LLama a la base de datos y trae todas las plantillas de turnos existentes y devuelve al usuario

exports.getShiftTemplates = async (req, res) => {
  try {
    const templates = await ShiftTemplate.find();
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las plantillas' }); //Si algo sale mal error.
  }
};
// registra los turnos, valida y guarda en la base de datos
exports.createShiftTemplate = async (req, res) => {
  try {
    const { name, startTime, endTime } = req.body;
    const newTemplate = new ShiftTemplate({ name, startTime, endTime });
    await newTemplate.save();
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear la plantilla' });
  }
};