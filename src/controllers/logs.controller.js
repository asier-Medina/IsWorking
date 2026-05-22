import logsService from '../services/logs.service.js'

// ── Auth logs ──────────────────────────────────────────
const createAuthLog = async (req, res, next) => {
  try {
    const log = await logsService.createAuthLog(req.body)
    res.status(201).json(log)
  } catch (error) { next(error) }
}

const getAuthLogs = async (req, res, next) => {
  try {
    const logs = await logsService.getAuthLogs(req.query)
    res.json(logs)
  } catch (error) { next(error) }
}

const deleteAuthLogs = async (req, res, next) => {
  try {
    const { before } = req.query
    if (!before) return res.status(400).json({ error: 'El parámetro before es obligatorio' })
    const result = await logsService.deleteAuthLogs(before)
    res.json({ deleted: result.deletedCount })
  } catch (error) { next(error) }
}

// ── Record logs ────────────────────────────────────────
const createRecordLog = async (req, res, next) => {
  try {
    const log = await logsService.createRecordLog(req.body)
    res.status(201).json(log)
  } catch (error) { next(error) }
}

const getRecordLogs = async (req, res, next) => {
  try {
    const logs = await logsService.getRecordLogs(req.query)
    res.json(logs)
  } catch (error) { next(error) }
}

const deleteRecordLogs = async (req, res, next) => {
  try {
    const { before } = req.query
    if (!before) return res.status(400).json({ error: 'El parámetro before es obligatorio' })
    const result = await logsService.deleteRecordLogs(before)
    res.json({ deleted: result.deletedCount })
  } catch (error) { next(error) }
}

// ── Admin logs ─────────────────────────────────────────
const createAdminLog = async (req, res, next) => {
  try {
    const log = await logsService.createAdminLog(req.body)
    res.status(201).json(log)
  } catch (error) { next(error) }
}

const getAdminLogs = async (req, res, next) => {
  try {
    const logs = await logsService.getAdminLogs(req.query)
    res.json(logs)
  } catch (error) { next(error) }
}

const deleteAdminLogs = async (req, res, next) => {
  try {
    const { before } = req.query
    if (!before) return res.status(400).json({ error: 'El parámetro before es obligatorio' })
    const result = await logsService.deleteAdminLogs(before)
    res.json({ deleted: result.deletedCount })
  } catch (error) { next(error) }
}

export default {
  createAuthLog,   getAuthLogs,   deleteAuthLogs,
  createRecordLog, getRecordLogs, deleteRecordLogs,
  createAdminLog,  getAdminLogs,  deleteAdminLogs,
}
