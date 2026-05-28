import { useState } from 'react'
import { useAuth } from "../../context/AuthContext";
import './Login.css'

export default function Login() {
  const { login }                       = useAuth()
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [error, setError]               = useState(null)
  const [loading, setLoading]           = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const user = await login(email, password)
      const redirects = {
        superadmin: '/superadmin/empresas',
        admin:      '/admin/empleados',
        employee:   '/dashboard'
      }
      window.location.href = redirects[user.role] ?? '/dashboard'
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__brand">
          <span className="login__logo" aria-hidden="true">IW</span>
          <span className="login__name">IsWorking</span>
        </div>

        <div className="login__intro">
          <h1 className="login__heading">Bienvenido</h1>
          <p className="login__sub">Accede para registrar tu jornada laboral</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <div className="login__field">
            <label className="login__label" htmlFor="email">Email</label>
            <input
              id="email"
              className="login__input"
              type="email"
              placeholder="tu@empresa.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="login__field">
            <label className="login__label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              className="login__input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="login__error" role="alert">{error}</p>}

          <button className="login__btn" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="login__footer">
          ¿Problemas para acceder? Contacta con tu administrador.
        </p>
      </div>
    </div>
  )
}