import { Router } from 'express'
import recordsController from '../controllers/records.controller.js'
import { protect, isAdmin } from '../middlewares/auth.js'

const router = Router()

router.get('/', protect, recordsController.getAll)
router.post('/', protect, recordsController.create)
router.get('/:id', protect, recordsController.getById)
router.patch('/:id', protect, recordsController.update)
router.delete('/:id', protect, isAdmin, recordsController.remove)

export default router