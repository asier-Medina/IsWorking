import mongoose from 'mongoose'

const logAdminSchema = new mongoose.Schema({
  admin_id:    { type: Number, required: true },
  company_id:  { type: Number },
  action:      { type: String, required: true },
  target_type: { type: String, enum: ['user', 'record', 'schedule', 'company'] },
  target_id:   { type: Number },
  detail:      { type: String },
  created_at:  { type: Date, default: Date.now }
})

export default mongoose.model('LogAdmin', logAdminSchema)
