import { Router } from 'express';
import {
  getShiftTemplates,
  createShiftTemplate
} from '../controllers/shifts.js';

const router = Router();

router.get('/', getShiftTemplates);
router.post('/', createShiftTemplate);

export default router;