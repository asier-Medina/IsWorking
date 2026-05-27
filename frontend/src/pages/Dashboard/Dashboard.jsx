import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import Clock from '../../components/Clock/Clock'
import api from '../../lib/api'

const navLinks = [
  { label: 'Mis fichajes', href: '/historial',
    icon: 'https://img.icons8.com/ios/48/3e35a8/time-card.png' }
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [initialStatus, setInitialStatus] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(true)

  const [showPwd, setShowPwd]       = useState(false)
  const [pwdForm, setPwdForm]       = useState({ currentPassword: '', newPassword: '' })
  const [pwdError, setPwdError]     = useState(null)
  const [pwdOk, setPwdOk]           = useState(false)
  const [pwdLoading, setPwdLoading] = useState(false)

  useEffect(() => {
    api.get('/records/status')
      .then(({ data }) => setInitialStatus(data))
      .catch(() => setInitialStatus({ lastRecord: null, nextAllowed: ['entry'], todayRecords: [] }))
      .finally(() => setLoadingStatus(false))
  }, [])

  const handlePwdSubmit = async (e) => {
    e.preventDefault()
    setPwdError(null)
    setPwdOk(false)
    setPwdLoading(true)
    try {
      await api.patch('/users/me/password', pwdForm)
      setPwdOk(true)
      setPwdForm({ currentPassword: '', newPassword: '' })
      setTimeout(() => { setShowPwd(false); setPwdOk(false) }, 1500)
    } catch (err) {
      setPwdError(err.response?.data?.error || err.response?.data?.message || 'Error al cambiar la contraseña')
    } finally {
      setPwdLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <Header user={user} navLinks={navLinks} onLogout={logout} />

      <main className="app-main">
        {loadingStatus ? (
          <p className="iw-text-muted dashboard__loading">Cargando...</p>
        ) : (
          <Clock
            mode={user?.remote_allowed ? 'remote' : 'office'}
            initialStatus={initialStatus}
          />
        )}

        <div className="dashboard__pwd-wrapper">
          <button
            className="iw-btn iw-btn--primary"
            onClick={() => { setShowPwd(p => !p); setPwdError(null); setPwdOk(false) }}
          >
            {showPwd ? 'Cancelar' : 'Cambiar contraseña'}
          </button>

          {showPwd && (
            <form className="dashboard__pwd-form" onSubmit={handlePwdSubmit}>
              <label className="dashboard__pwd-label">
                Contraseña actual
                <input
                  className="dashboard__pwd-input"
                  type="password"
                  value={pwdForm.currentPassword}
                  onChange={e => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))}
                  required
                />
              </label>

              <label className="dashboard__pwd-label">
                Nueva contraseña
                <input
                  className="dashboard__pwd-input"
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))}
                  required
                  minLength={6}
                />
              </label>

              {pwdError && <p className="iw-text-danger dashboard__pwd-msg">{pwdError}</p>}
              {pwdOk    && <p className="iw-text-success dashboard__pwd-msg">Contraseña actualizada</p>}

              <button
                type="submit"
                className="iw-btn iw-btn--primary"
                disabled={pwdLoading}
              >
                {pwdLoading ? 'Guardando...' : 'Actualizar contraseña'}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}