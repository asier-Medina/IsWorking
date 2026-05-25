import { Op } from 'sequelize'
import TimeRecord from '../models/postgres/TimeRecord.js'
import User from '../models/postgres/User.js'
import logsService from './logs.service.js'

const NEXT_VALID_TYPE = {
  null: ['entry'],
  entry: ['break_start', 'exit'],
  break_start: ['break_end'],
  break_end: ['exit'],
  exit: ['entry']
}

const getAll = async (userId, role, companyId) => {
  if (role === 'superadmin') {
    return await TimeRecord.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'company_id', 'role']
        }
      ],
      order: [['timestamp', 'DESC']]
    })
  }

  if (role === 'admin') {
    return await TimeRecord.findAll({
      include: [
        {
          model: User,
          as: 'user',
          where: { company_id: companyId },
          attributes: ['id', 'name', 'email', 'company_id', 'role']
        }
      ],
      order: [['timestamp', 'DESC']]
    })
  }

  return await TimeRecord.findAll({
    where: { user_id: userId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'company_id', 'role']
      }
    ],
    order: [['timestamp', 'DESC']]
  })
}

const getById = async (id, userId, role) => {
  const record = await TimeRecord.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'company_id', 'role']
      }
    ]
  })

  if (!record) {
    const error = new Error('Registro no encontrado')
    error.statusCode = 404
    throw error
  }

  if (role === 'employee' && record.user_id !== userId) {
    const error = new Error('No autorizado')
    error.statusCode = 403
    throw error
  }

  return record
}

const create = async ({ userId, type, mode, latitude, longitude, accuracy, scheduleId }) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const last = await TimeRecord.findOne({
    where: {
      user_id: userId,
      timestamp: { [Op.gte]: today }
    },
    order: [['timestamp', 'DESC']]
  })

  const lastType = last?.type || null
  const validTypes = NEXT_VALID_TYPE[lastType]

  if (!validTypes.includes(type)) {
    const error = new Error(
      `Fichaje inválido. Después de "${lastType || 'nada'}" se espera: ${validTypes.join(' o ')}`
    )
    error.statusCode = 400
    throw error
  }

  const record = await TimeRecord.create({
    user_id: userId,
    type,
    mode,
    latitude,
    longitude,
    accuracy,
    schedule_id: scheduleId || null,
    timestamp: new Date()
  })

  try {
    await logsService.createRecordLog({
      record_id: record.id,
      user_id: userId,
      action: 'create',
      type,
      mode,
      latitude,
      longitude,
      accuracy
    })
  } catch (err) {
    console.error('Error escribiendo log de fichaje:', err.message)
  }

  return record
}

const update = async (id, userId, role, datos) => {
  const record = await TimeRecord.findByPk(id)

  if (!record) {
    const error = new Error('Registro no encontrado')
    error.statusCode = 404
    throw error
  }

  if (role === 'employee' && record.user_id !== userId) {
    const error = new Error('No autorizado')
    error.statusCode = 403
    throw error
  }

  await record.update(datos)
  return record
}

const remove = async (id) => {
  const record = await TimeRecord.findByPk(id)

  if (!record) {
    const error = new Error('Registro no encontrado')
    error.statusCode = 404
    throw error
  }

  await record.destroy()
}

const getStatus = async (userId) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayRecords = await TimeRecord.findAll({
    where: {
      user_id: userId,
      timestamp: { [Op.gte]: today }
    },
    order: [['timestamp', 'ASC']]
  })

  const lastRecord = todayRecords.at(-1) || null
  const lastType = lastRecord?.type || null

  return {
    lastRecord,
    nextAllowed: NEXT_VALID_TYPE[lastType],
    todayRecords
  }
}

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  getStatus
}
