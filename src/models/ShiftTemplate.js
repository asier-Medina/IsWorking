const mongoose = require('mongoose');

//Registro de turnos (Jornadas mañana, tarde, noche)
const ShiftTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },       
  startTime: { type: String, required: true },  
  endTime: { type: String, required: true }   
}, { timestamps: true });

module.exports = mongoose.model('ShiftTemplate', ShiftTemplateSchema);