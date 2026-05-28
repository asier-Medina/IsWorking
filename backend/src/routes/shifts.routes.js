import { Router } from 'express'
import {
  getShiftTemplates,
  createShiftTemplate
} from '../controllers/shifts.controller.js'
import { protect, isAdmin } from '../middlewares/auth.js'

const router = Router()

router.use(protect)

router.get('/',  getShiftTemplates)              // todos pueden ver las plantillas
router.post('/', isAdmin, createShiftTemplate)  // solo admin crea plantillas

export default router