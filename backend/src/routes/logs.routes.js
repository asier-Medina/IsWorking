import { Router } from 'express'
import logsController from '../controllers/logs.controller.js'
import { protect, isAdmin } from '../middlewares/auth.js'

const logsrouter = Router()

// Auth logs
logsrouter.post('/auth',   protect, isAdmin, logsController.createAuthLog)
logsrouter.get('/auth',    protect, isAdmin, logsController.getAuthLogs)
logsrouter.delete('/auth', protect, isAdmin, logsController.deleteAuthLogs)

// Record logs
logsrouter.post('/records',   protect, isAdmin, logsController.createRecordLog)
logsrouter.get('/records',    protect, isAdmin, logsController.getRecordLogs)
logsrouter.delete('/records', protect, isAdmin, logsController.deleteRecordLogs)

// Admin logs
logsrouter.post('/admin',   protect, isAdmin, logsController.createAdminLog)
logsrouter.get('/admin',    protect, isAdmin, logsController.getAdminLogs)
logsrouter.delete('/admin', protect, isAdmin, logsController.deleteAdminLogs)

export default logsrouter
