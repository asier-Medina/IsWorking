// src/middlewares/auth.js — versión temporal
export const protect = (req, res, next) => {
  // Por ahora simula un usuario logueado para no bloquear el desarrollo
  req.user = { id: 1, role: 'admin', company_id: 1 }
  next()
}

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  next()
}