import { Router } from "express";
import * as userController from '../controllers/user.controller.js'
import { protect, isAdmin } from '../middlewares/auth.js'

const router = Router();

router.use(protect, isAdmin);

router.get('/', userController.getUsers)

router.post('/', userController.createEmploye)

router.put('/:id', userController.updateEmploye)

router.patch('/:id/status', userController.toggleEmployeStatus)

export default router