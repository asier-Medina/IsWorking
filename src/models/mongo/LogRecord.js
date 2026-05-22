import mongoose from 'mongoose'

const logRecordSchema = new mongoose.Schema({
  user_id:     { type: Number, required: true },
  company_id:  { type: Number },
  record_id:   { type: Number },
  action:      { type: String, enum: ['create', 'update', 'delete'], required: true },
  type:        { type: String, enum: ['entry', 'break_start', 'break_end', 'exit'] },
  mode:        { type: String, enum: ['office', 'remote'] },
  latitude:    { type: Number },
  longitude:   { type: Number },
  created_at:  { type: Date, default: Date.now }
})

export default mongoose.model('LogRecord', logRecordSchema)
