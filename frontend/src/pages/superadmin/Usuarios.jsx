import { useState, useEffect, useCallback, useMemo } from 'react'
import { superadminApi } from '../../lib/superadminApi'
import './superadmin.css'

const ROLE_LABELS = {
  superadmin: 'Superadmin',
  admin:      'Admin',
  employee:   'Empleado'
}

function UsuarioCard({ usuario, companyName, onToggle, loading }) {
  const isActive    = usuario.active !== false
  const displayName = usuario.name ?? 'Sin nombre'
  const initials    = displayName.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')

  return (
    <article
      className={`sa-card ${isActive ? 'sa-card--active' : 'sa-card--inactive'}`}
      aria-label={`${displayName}, ${isActive ? 'activo' : 'inactivo'}`}
    >
      <div className="sa-card__logo" aria-hidden="true">
        <span className="sa-card__logo-initials">{initials}</span>
      </div>

      <div className="sa-card__info">
        <p className="sa-card__name">{displayName}</p>
        <p className="sa-card__subtitle">
          {companyName ?? `Empresa #${usuario.company_id}`} · {ROLE_LABELS[usuario.role] ?? usuario.role}
        </p>
      </div>

      <span className={`sa-card__badge ${isActive ? 'sa-card__badge--active' : 'sa-card__badge--inactive'}`}>
        {isActive ? 'ACTIVO' : 'INACTIVO'}
      </span>

      <div className="sa-card__actions">
        <button
          className={`sa-card__btn ${isActive ? 'sa-card__btn--deactivate' : 'sa-card__btn--activate'}`}
          onClick={() => onToggle(usuario.id, isActive)}
          disabled={loading === usuario.id}
        >
          {loading === usuario.id ? 'Procesando...' : isActive ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </article>
  )
}

export default function Usuarios() {
  const [usuarios, setUsuarios]   = useState([])
  const [empresas, setEmpresas]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState(null)
  const [toggling, setToggling]   = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, companiesRes] = await Promise.all([
          superadminApi.getAllUsers(),
          superadminApi.getCompanies()
        ])
        setUsuarios(usersRes.data.data ?? usersRes.data)
        setEmpresas(companiesRes.data.companies ?? companiesRes.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Error cargando usuarios')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const empresaMap = useMemo(() =>
    Object.fromEntries(empresas.map(e => [e.id, e.name ?? `Empresa #${e.id}`]))
  , [empresas])

  const toggleUsuario = useCallback(async (id, currentlyActive) => {
    setToggling(id)
    try {
      await superadminApi.setUserStatus(id, !currentlyActive)
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, active: !currentlyActive } : u))
    } catch (err) {
      alert(`No se pudo actualizar el usuario: ${err.response?.data?.error || err.message}`)
    } finally {
      setToggling(null)
    }
  }, [])

  return (
    <div className="sa-page">
      <div className="sa-header">
        <h1 className="sa-title">Usuarios</h1>
      </div>

      {isLoading && <p className="sa-loading">Cargando usuarios...</p>}
      {error     && <p className="sa-error" role="alert">{error}</p>}

      {!isLoading && !error && (
        <div className="sa-list" id="usuarios-list">
          {usuarios.length === 0
            ? <p className="sa-empty">No hay usuarios registrados.</p>
            : usuarios.map(u => (
                <UsuarioCard
                  key={u.id}
                  usuario={u}
                  companyName={empresaMap[u.company_id]}
                  onToggle={toggleUsuario}
                  loading={toggling}
                />
              ))
          }
        </div>
      )}
    </div>
  )
}