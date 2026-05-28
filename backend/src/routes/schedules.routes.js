import { Router } from 'express'
import {
  getSchedules,
  assignShift,
  updateScheduleStatus
} from '../controllers/schedules.controller.js'
import { protect, isAdmin } from '../middlewares/auth.js'

const router = Router()

router.use(protect)

router.get('/',            getSchedules)           // employee ve los suyos, admin ve todos
router.post('/',           isAdmin, assignShift)   // solo admin asigna turnos
router.patch('/:id/status', isAdmin, updateScheduleStatus) // solo admin cambia estado

export default router