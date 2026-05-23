import {
  getSchedulesService,
  assignShiftService,
  updateScheduleStatusService
} from '../services/schedules.service.js'

const VALID_STATUSES = ['assigned', 'confirmed', 'absent']

// GET /api/schedules
export const getSchedules = async (req, res, next) => {
  try {
    const { role, id: userId, company_id } = req.user

    // Empleado solo ve sus propios horarios
    const filters = {
      ...req.query,
      ...(role === 'employee' && { userId })
    }

    const schedules = await getSchedulesService(filters, company_id, role)
    res.json(schedules)
  } catch (error) {
    next(error)
  }
}

// POST /api/schedules
export const assignShift = async (req, res, next) => {
  try {
    const { user_id, shift_template_id, work_date } = req.body

    if (!user_id || !shift_template_id || !work_date) {
      return res.status(400).json({
        error: 'user_id, shift_template_id y work_date son obligatorios'
      })
    }

    const schedule = await assignShiftService({
      user_id,
      shift_template_id,
      work_date,
      created_by: req.user.id
    })
    res.status(201).json(schedule)
  } catch (error) {
    next(error)
  }
}

// PATCH /api/schedules/:id
export const updateScheduleStatus = async (req, res, next) => {
  try {
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: 'El campo status es obligatorio' })
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Status inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`
      })
    }

    const schedule = await updateScheduleStatusService(req.params.id, status)
    if (!schedule) return res.status(404).json({ error: 'Horario no encontrado' })

    res.json(schedule)
  } catch (error) {
    next(error)
  }
}