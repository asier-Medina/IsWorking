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

  // Cambiar contraseña
  const [showPwd, setShowPwd]         = useState(false)
  const [pwdForm, setPwdForm]         = useState({ currentPassword: '', newPassword: '' })
  const [pwdError, setPwdError]       = useState(null)
  const [pwdOk, setPwdOk]             = useState(false)
  const [pwdLoading, setPwdLoading]   = useState(false)

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header user={user} navLinks={navLinks} onLogout={logout} />

      <main className="app-main">
        {loadingStatus ? (
          <p style={{ textAlign: 'center', color: 'var(--iw-text-muted)' }}>Cargando...</p>
        ) : (
          <Clock
            mode={user?.remote_allowed ? 'remote' : 'office'}
            initialStatus={initialStatus}
          />
        )}

        {/* Cambiar contraseña */}
        <div style={{ maxWidth: 420, margin: '1.5rem auto 0', textAlign: 'center' }}>
          <button
            onClick={() => { setShowPwd(p => !p); setPwdError(null); setPwdOk(false) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--iw-text-muted)', fontSize: 'var(--iw-font-size-sm)',
              textDecoration: 'underline'
            }}
          >
            {showPwd ? 'Cancelar' : 'Cambiar contraseña'}
          </button>

          {showPwd && (
            <form
              onSubmit={handlePwdSubmit}
              style={{
                marginTop: '1rem',
                background: 'var(--iw-surface)',
                border: '1.5px solid var(--iw-border)',
                borderRadius: 'var(--iw-radius-md)',
                padding: '1.25rem',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                textAlign: 'left'
              }}
            >
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontWeight: 600, fontSize: 'var(--iw-font-size-md)' }}>
                Contraseña actual
                <input
                  type="password"
                  value={pwdForm.currentPassword}
                  onChange={e => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))}
                  required
                  style={{ padding: '0.6rem', borderRadius: 'var(--iw-radius-sm)', border: '1.5px solid var(--iw-border)', fontFamily: 'inherit', fontSize: 'var(--iw-font-size-md)' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontWeight: 600, fontSize: 'var(--iw-font-size-md)' }}>
                Nueva contraseña
                <input
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))}
                  required
                  minLength={6}
                  style={{ padding: '0.6rem', borderRadius: 'var(--iw-radius-sm)', border: '1.5px solid var(--iw-border)', fontFamily: 'inherit', fontSize: 'var(--iw-font-size-md)' }}
                />
              </label>

              {pwdError && <p style={{ color: 'var(--iw-danger)', fontSize: 'var(--iw-font-size-sm)', margin: 0 }}>{pwdError}</p>}
              {pwdOk    && <p style={{ color: 'var(--iw-success)', fontSize: 'var(--iw-font-size-sm)', margin: 0 }}>✓ Contraseña actualizada</p>}

              <button
                type="submit"
                disabled={pwdLoading}
                style={{
                  padding: '0.65rem', borderRadius: 'var(--iw-radius-sm)',
                  border: 'none', background: 'var(--iw-primary)', color: '#fff',
                  fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer',
                  fontSize: 'var(--iw-font-size-md)', opacity: pwdLoading ? 0.7 : 1
                }}
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