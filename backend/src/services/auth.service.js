import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/postgres/User.js'
import LogAuth from '../models/mongo/LogAuth.js'

// ── Helpers de token ──────────────────────────────────────

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, company_id: user.company_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  )

// ── Register ────────────────────────────────────────────────
export const register = async ({ name, email, password, company_id, role = 'employee' }) => {
  const normalizedEmail = email?.trim().toLowerCase()

  const exists = await User.findOne({ where: { email: normalizedEmail } })
  if (exists) throw new Error('El email ya está registrado')

  const password_hash = await bcrypt.hash(password, 10)

  const user = await User.create({
    name,
    email: normalizedEmail,
    password_hash,
    company_id,
    role,
    active: true
  })

  await LogAuth.create({
    user_id:  user.id,
    email:    user.email,
    action:   'register',
    success:  true
  })

  return { id: user.id, name: user.name, role: user.role, company_id: user.company_id }
}
// ── Login ─────────────────────────────────────────────────

export const login = async ({ email, password, ip, userAgent }) => {
  const normalizedEmail = email?.trim().toLowerCase()
  const user = await User.findOne({ where: { email: normalizedEmail } })

  // Usuario no existe o contraseña incorrecta — mismo mensaje por seguridad
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    await LogAuth.create({
      user_id: user?.id || 0,
      email: normalizedEmail,
      action: 'login_failed',
      ip,
      user_agent: userAgent,
      success: false,
      reason: !user ? 'user_not_found' : 'wrong_password'
    })

    throw new Error('Credenciales incorrectas')
  }

  if (!user.active) throw new Error('Usuario desactivado')

  const accessToken  = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  await LogAuth.create({
    user_id:    user.id,
    email:      user.email,
    action:     'login',
    ip,
    user_agent: userAgent,
    success:    true
  })

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, role: user.role, company_id: user.company_id }
  }
}

// ── Refresh token ─────────────────────────────────────────

export const refresh = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
  const user = await User.findByPk(decoded.id)

  if (!user || !user.active) throw new Error('Usuario no válido')

  const newAccessToken = generateAccessToken(user)

  await LogAuth.create({
    user_id:    user.id,
    email:      user.email,
    action:     'token_refresh',
    success:    true
  })

  return newAccessToken
}

// ── Logout ────────────────────────────────────────────────

export const logout = async (userId, email) => {
  await LogAuth.create({
    user_id: userId,
    email:   email || 'unknown',  // evita el error si viene vacío
    action:  'logout',
    success: true
  })
}

