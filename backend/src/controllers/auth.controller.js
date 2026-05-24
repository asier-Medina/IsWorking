import * as authService from '../services/auth.service.js'

const cookieOptions = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict'
}
export const registerHandler = async (req, res) => {
  try {
    const { name, email, password, company_id, role } = req.body
    const user = await authService.register({ name, email, password, company_id, role })
    res.status(201).json({ user })

  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body
    const ip        = req.ip
    const userAgent = req.headers['user-agent']

    const { accessToken, refreshToken, user } =
      await authService.login({ email, password, ip, userAgent })

    res.cookie('access_token',  accessToken,  { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    res.cookie('refresh_token', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.json({ user })

  } catch (error) {
    res.status(401).json({ error: error.message })
  }
}

export const refreshHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token
    if (!refreshToken) return res.status(401).json({ error: 'Sin refresh token' })

    const newAccessToken = await authService.refresh(refreshToken)

    res.cookie('access_token', newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000
    })

    res.json({ ok: true })

  } catch (error) {
    res.status(401).json({ error: 'Refresh token inválido' })
  }
}

export const logoutHandler = async (req, res) => {
  try {
    // Intenta loggear si hay usuario, pero no falla si no lo hay
    if (req.user) {
      await authService.logout(req.user.id, req.user.email)
    }

    res.clearCookie('access_token')
    res.clearCookie('refresh_token')

    res.json({ ok: true })

  } catch (error) {
    console.error('Error en logout:', error.message)
    res.status(500).json({ error: 'Error al cerrar sesión' })
  }
}
