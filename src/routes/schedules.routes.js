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