import LogAuth   from '../models/mongo/LogAuth.js'
import LogRecord from '../models/mongo/LogRecord.js'
import LogAdmin  from '../models/mongo/LogAdmin.js'

// ── Auth logs ──────────────────────────────────────────
const createAuthLog = async (data) => {
  return await LogAuth.create(data)
}

const getAuthLogs = async (filters = {}) => {
  const query = {}
  if (filters.user_id)  query.user_id  = filters.user_id
  if (filters.action)   query.action   = filters.action
  if (filters.date) {
    const start = new Date(filters.date)
    const end   = new Date(filters.date)
    end.setDate(end.getDate() + 1)
    query.created_at = { $gte: start, $lt: end }
  }
  return await LogAuth.find(query).sort({ created_at: -1 })
}

const deleteAuthLogs = async (before) => {
  return await LogAuth.deleteMany({ created_at: { $lt: new Date(before) } })
}

// ── Record logs ────────────────────────────────────────
const createRecordLog = async (data) => {
  return await LogRecord.create(data)
}

const getRecordLogs = async (filters = {}) => {
  const query = {}
  if (filters.user_id)    query.user_id    = filters.user_id
  if (filters.company_id) query.company_id = filters.company_id
  if (filters.date) {
    const start = new Date(filters.date)
    const end   = new Date(filters.date)
    end.setDate(end.getDate() + 1)
    query.created_at = { $gte: start, $lt: end }
  }
  return await LogRecord.find(query).sort({ created_at: -1 })
}

const deleteRecordLogs = async (before) => {
  return await LogRecord.deleteMany({ created_at: { $lt: new Date(before) } })
}

// ── Admin logs ─────────────────────────────────────────
const createAdminLog = async (data) => {
  return await LogAdmin.create(data)
}

const getAdminLogs = async (filters = {}) => {
  const query = {}
  if (filters.admin_id)   query.admin_id   = filters.admin_id
  if (filters.company_id) query.company_id = filters.company_id
  if (filters.date) {
    const start = new Date(filters.date)
    const end   = new Date(filters.date)
    end.setDate(end.getDate() + 1)
    query.created_at = { $gte: start, $lt: end }
  }
  return await LogAdmin.find(query).sort({ created_at: -1 })
}

const deleteAdminLogs = async (before) => {
  return await LogAdmin.deleteMany({ created_at: { $lt: new Date(before) } })
}

export default {
  createAuthLog,   getAuthLogs,   deleteAuthLogs,
  createRecordLog, getRecordLogs, deleteRecordLogs,
  createAdminLog,  getAdminLogs,  deleteAdminLogs,
}
