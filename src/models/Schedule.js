import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shiftTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShiftTemplate', required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  }
}, { timestamps: true });

ScheduleSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Schedule = mongoose.model('Schedule', ScheduleSchema);
export default Schedule;