//aqui iran las rutas de la aplicacion, es decir, las funciones que se encargaran de manejar las rutas y la logica de negocio de la aplicacion

import { Router } from 'express';
import {
  getSchedules,
  assignShift,
  updateScheduleStatus
} from '../controllers/schedules.js';

const router = Router();

router.get('/', getSchedules);
router.post('/', assignShift);
router.patch('/:id', updateScheduleStatus);

export default router;