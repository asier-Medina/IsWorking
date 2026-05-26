import { Router } from 'express'
import * as userController from '../controllers/user.controller.js'
import { protect, isAdmin } from '../middlewares/auth.js'

const router = Router()

router.use(protect)

// Ruta propia del usuario — no necesita isAdmin
router.patch('/me/password', userController.changePasswordHandler)

// Rutas de admin
router.get('/',              isAdmin, userController.getUsers)
router.get('/:id',           isAdmin, userController.getUserById)
router.post('/',             isAdmin, userController.createEmployee)
router.patch('/:id',         isAdmin, userController.updateEmployee)
router.patch('/:id/status',  isAdmin, userController.toggleEmployeeStatus)

export default router