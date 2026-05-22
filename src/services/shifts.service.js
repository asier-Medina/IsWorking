import {
  getShiftTemplatesService,
  createShiftTemplateService
} from '../services/shifts.service.js';

export const getShiftTemplates = async (req, res) => {
  try {
    const templates = await getShiftTemplatesService();
    res.status(200).json(templates);
  } catch (error) {
    console.error('getShiftTemplates error:', error);
    res.status(500).json({ error: 'Error al obtener las plantillas' });
  }
};

export const createShiftTemplate = async (req, res) => {
  try {
    const newTemplate = await createShiftTemplateService(req.body);
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('createShiftTemplate error:', error);
    res.status(400).json({ error: 'Error al crear la plantilla' });
  }
};