import jwt from 'jsonwebtoken'
import User from '../models/postgres/User.js'

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.access_token
    if (!token) return res.status(401).json({ error: 'No autenticado' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findByPk(decoded.id)
    if (!user || !user.active) return res.status(401).json({ error: 'Usuario no válido' })

    req.user = user  // mismo req.user que usaba el middleware temporal
    next()

  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

export const isAdmin = (req, res, next) => {
  if (!['admin', 'superadmin'].includes(req.user.role))
    return res.status(403).json({ error: 'Acceso denegado' })
  next()
}

export const isSameCompany = (req, res, next) => {
  // Evita que un admin vea datos de otra empresa
  if (req.user.role !== 'superadmin' &&
      req.user.company_id !== parseInt(req.params.company_id)) {
    return res.status(403).json({ error: 'Acceso denegado' })
  }
  next()
}