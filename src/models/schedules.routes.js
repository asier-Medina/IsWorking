const express = require('express');
const router = express.Router();
const schedulesController = require('../controllers/schedules');

router.get('/', schedulesController.getSchedules);
router.post('/', schedulesController.assignShift);
router.patch('/:id', schedulesController.updateScheduleStatus);

module.exports = router;