import { Router } from 'express'
import recordsController from '../controllers/records.controller.js'
import { protect, isAdmin } from '../middlewares/auth.js'

const router = Router()

router.use(protect)

router.get('/',      recordsController.getAll)
router.post('/',     recordsController.create)
router.post('/sync', recordsController.sync)       //offline sync
router.get('/status', recordsController.getStatus) 
router.get('/:id',   recordsController.getById)
router.patch('/:id', recordsController.update)
router.delete('/:id', isAdmin, recordsController.remove)

export default router