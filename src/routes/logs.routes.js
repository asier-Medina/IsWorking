import { Router } from 'express'
import logsController from '../controllers/logs.controller.js'
import { protect, isAdmin } from '../middlewares/auth.js'

const router = Router()

// Auth logs
router.post('/auth',   protect, isAdmin, logsController.createAuthLog)
router.get('/auth',    protect, isAdmin, logsController.getAuthLogs)
router.delete('/auth', protect, isAdmin, logsController.deleteAuthLogs)

// Record logs
router.post('/records',   protect, isAdmin, logsController.createRecordLog)
router.get('/records',    protect, isAdmin, logsController.getRecordLogs)
router.delete('/records', protect, isAdmin, logsController.deleteRecordLogs)

// Admin logs
router.post('/admin',   protect, isAdmin, logsController.createAdminLog)
router.get('/admin',    protect, isAdmin, logsController.getAdminLogs)
router.delete('/admin', protect, isAdmin, logsController.deleteAdminLogs)

export default router
