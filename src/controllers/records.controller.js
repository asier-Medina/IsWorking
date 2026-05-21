import recordsService from '../services/records.service.js'

const getAll = async (req, res, next) => {
  try {
    const { id, role } = req.user                 
    const records = await recordsService.getAll(id, role)
    res.json(records)
  } catch (error) {
    next(error)
  }
}

const getById = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user      
    const record = await recordsService.getById(Number(req.params.id), userId, role)
    res.json(record)
  } catch (error) {
    next(error)
  }
}

const create = async (req, res, next) => {
  try {
    const { id: userId } = req.user
    const { type, mode, latitude, longitude, accuracy, scheduleId } = req.body
    if (!type) {
      return res.status(400).json({ error: 'El campo type es obligatorio' })
    }
    const record = await recordsService.create({ userId, type, mode, latitude, longitude, accuracy, scheduleId })
    res.status(201).json(record)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user           
    const record = await recordsService.update(
      Number(req.params.id), userId, role, req.body
    )
    res.json(record)
  } catch (error) {
    next(error)
  }
}

export default { getAll, getById, create, update }