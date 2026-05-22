import TimeRecord from '../models/postgres/TimeRecord.js'

const getAll = async (userId, role) => {                      
  const where = role === 'admin' || role === 'superadmin'     
    ? {} 
    : { user_id: userId }                                     
  return await TimeRecord.findAll({ where, order: [['timestamp', 'DESC']] })
}

const getById = async (id, userId, role) => {                  
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
  return record
}

const create = async ({ userId, type, mode, latitude, longitude, accuracy, scheduleId }) => {
  return await TimeRecord.create({
    user_id: userId,                
    type,
    mode,                            
    latitude,
    longitude,
    accuracy,                        
    schedule_id: scheduleId || null, 
    timestamp: new Date(),
  })
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

export default { getAll, getById, create, update }