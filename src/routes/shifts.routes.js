// routes/shifts.routes.js
import { Router } from 'express';
import {
  getShiftTemplates,
  createShiftTemplate
} from '../controllers/shifts.controller.js';

const router = Router();

router.get('/', getShiftTemplates);
router.post('/', createShiftTemplate);

export default router;