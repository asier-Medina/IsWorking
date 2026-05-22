import { Router } from 'express'
import { loginHandler, refreshHandler, logoutHandler, registerHandler } from '../controllers/auth.controller.js'
import { protect,isAdmin} from '../middlewares/auth.js'

const router = Router();

router.post('/register', registerHandler)  // solo admin crea usuarios
router.post('/login',    loginHandler)
router.post('/refresh',  refreshHandler)
router.post('/logout',   protect, logoutHandler)

export default router;