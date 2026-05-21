const express = require('express');
const router = express.Router();
const shiftsController = require('../controllers/shifts');

router.get('/', shiftsController.getShiftTemplates);
router.post('/', shiftsController.createShiftTemplate);

module.exports = router;