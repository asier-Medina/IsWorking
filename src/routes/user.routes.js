import { Router } from 'express'
import * as userController from '../controllers/user.controller.js'
import { protect, isAdmin } from '../middlewares/auth.js'

const router = Router()

router.use(protect)

router.get('/',              isAdmin, userController.getUsers)
router.get('/:id',           isAdmin, userController.getUserById)      // ← nuevo
router.post('/',             isAdmin, userController.createEmployee)
router.patch('/:id',         isAdmin, userController.updateEmployee)   // patch en vez de put
router.patch('/:id/status',  isAdmin, userController.toggleEmployeeStatus)

export default router