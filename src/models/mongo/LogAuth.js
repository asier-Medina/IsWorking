import mongoose from 'mongoose'

const logAuthSchema = new mongoose.Schema({
  user_id:    { type: Number },
  email:      { type: String },
  action:     { 
    type: String, 
    enum: ['register', 'login', 'logout', 'login_failed', 'token_refresh'],
    required: true
  },
  ip:         { type: String },
  user_agent: { type: String },
  success:    { type: Boolean, default: true },
  reason:     { type: String },
  created_at: { type: Date, default: Date.now }
})

export default mongoose.model('LogAuth', logAuthSchema)