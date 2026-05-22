import { Router } from 'express';
import {
  getSchedules,
  assignShift,
  updateScheduleStatus
} from '../controllers/schedules.controller.js';

const router = Router();

router.get('/', getSchedules);
router.post('/', assignShift);
router.patch('/:id/status', updateScheduleStatus);

export default router;