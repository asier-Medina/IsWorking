import {
  getShiftTemplatesService,
  createShiftTemplateService
} from '../services/shifts.service.js'

const VALID_TYPES = ['morning', 'afternoon', 'split']

// GET /api/shift-templates
export const getShiftTemplates = async (req, res, next) => {
  try {
    const templates = await getShiftTemplatesService()
    res.json(templates)
  } catch (error) {
    next(error)
  }
}

// POST /api/shift-templates
export const createShiftTemplate = async (req, res, next) => {
  try {
    const { name, type, start_time, end_time, break_start, break_end, has_break } = req.body
    const company_id = req.user.company_id  // siempre de req.user, nunca del body

    if (!name || !type || !start_time || !end_time) {
      return res.status(400).json({
        error: 'name, type, start_time y end_time son obligatorios'
      })
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        error: `Tipo inválido. Valores permitidos: ${VALID_TYPES.join(', ')}`
      })
    }

    const template = await createShiftTemplateService({
      company_id, name, type, start_time, end_time,
      break_start, break_end, has_break
    })
    res.status(201).json(template)
  } catch (error) {
    next(error)
  }
}