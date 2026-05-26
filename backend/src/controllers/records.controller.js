import recordsService from '../services/records.service.js'

// GET /api/records
const getAll = async (req, res, next) => {
  try {
    const { id, role, company_id } = req.user
    const records = await recordsService.getAll(id, role, company_id)
    res.json(records)
  } catch (error) {
    next(error)
  }
}

// GET /api/records/:id
const getById = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user
    const record = await recordsService.getById(Number(req.params.id), userId, role)
    res.json(record)
  } catch (error) {
    next(error)
  }
}

// POST /api/records
const create = async (req, res, next) => {
  try {
    const { id: userId } = req.user
    const { type, mode, latitude, longitude, accuracy } = req.body

    if (!type) return res.status(400).json({ error: 'El campo type es obligatorio' })
    if (!mode) return res.status(400).json({ error: 'El campo mode es obligatorio' })


    const record = await recordsService.create({
      userId, type, mode, latitude, longitude, accuracy
    })
    res.status(201).json(record)
  } catch (error) {
    next(error)
  }
}

// POST /api/records/sync — fichajes guardados offline
const sync = async (req, res, next) => {
  try {
    const { id: userId } = req.user
    const { records } = req.body

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Se esperaba un array de registros' })
    }

    // Ordenar por timestamp antes de insertar para respetar la secuencia
    const sorted = [...records].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    )

    const created = []
    const errors = []

    for (const r of sorted) {
      try {
        const record = await recordsService.create({
          userId,
          type: r.type,
          mode: r.mode,
          latitude: r.latitude,
          longitude: r.longitude,
          accuracy: r.accuracy,
          scheduleId: r.scheduleId || null
        })
        created.push(record.id)
      } catch (err) {
        errors.push({ timestamp: r.timestamp, error: err.message })
      }
    }

    res.json({
      synced: created.length,
      failed: errors.length,
      errors
    })
  } catch (error) {
    next(error)
  }
}

// PATCH /api/records/:id
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

// DELETE /api/records/:id
const remove = async (req, res, next) => {
  try {
    await recordsService.remove(Number(req.params.id))
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

// GET /api/records/status — estado actual del empleado (fichado o no)
const getStatus = async (req, res, next) => {
  try {
    const { id: userId } = req.user
    const status = await recordsService.getStatus(userId)
    res.json(status)
  } catch (error) {
    next(error)
  }
}

export default { getAll, getById, create, sync, update, remove, getStatus }