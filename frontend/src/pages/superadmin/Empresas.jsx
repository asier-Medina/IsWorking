import { useState, useEffect, useCallback } from 'react'
import { superadminApi } from '../../lib/superadminApi'
import './superadmin.css'

const INITIAL_FORM = {
  name: '',
  timezone: 'Europe/Madrid',
  office_latitude: '',
  office_longitude: '',
  office_radius_m: 200,
  admin_name: '',
  admin_email: '',
  admin_password: ''
}

const inputStyle = {
  padding: '0.6rem',
  borderRadius: 'var(--iw-radius-sm)',
  border: '1.5px solid var(--iw-border)',
  fontFamily: 'inherit',
  fontSize: 'var(--iw-font-size-md)',
  width: '100%'
}

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
  fontWeight: 600,
  fontSize: 'var(--iw-font-size-md)'
}

function EmpresaCard({ empresa, onToggle, loading }) {
  const isActive    = empresa.active !== false
  const displayName = empresa.name ?? 'Sin nombre'
  const initials    = displayName.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')

  return (
    <article
      className={`sa-card ${isActive ? 'sa-card--active' : 'sa-card--inactive'}`}
      aria-label={`${displayName}, ${isActive ? 'activa' : 'inactiva'}`}
    >
      <div className="sa-card__logo" aria-hidden="true">
        <span className="sa-card__logo-initials">{initials}</span>
      </div>

      <div className="sa-card__info">
        <p className="sa-card__name">{displayName}</p>
        <p className="sa-card__subtitle">{empresa.timezone ?? 'Europe/Madrid'}</p>
      </div>

      <span className={`sa-card__badge ${isActive ? 'sa-card__badge--active' : 'sa-card__badge--inactive'}`}>
        {isActive ? 'ACTIVA' : 'INACTIVA'}
      </span>

      <div className="sa-card__actions">
        <button
          className={`sa-card__btn ${isActive ? 'sa-card__btn--deactivate' : 'sa-card__btn--activate'}`}
          onClick={() => onToggle(empresa.id, isActive)}
          disabled={loading === empresa.id}
        >
          {loading === empresa.id ? 'Procesando...' : isActive ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </article>
  )
}

export default function Empresas() {
  const [empresas, setEmpresas]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState(null)
  const [toggling, setToggling]   = useState(null)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(INITIAL_FORM)
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState(null)

  const loadEmpresas = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { data } = await superadminApi.getCompanies()
      setEmpresas(data.companies ?? data)
    } catch (err) {
      setError(err.response?.data?.error || 'Error cargando empresas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadEmpresas() }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!form.name || !form.admin_name || !form.admin_email || !form.admin_password) {
      setFormError('Nombre de empresa, nombre, email y contraseña del admin son obligatorios')
      return
    }

    try {
      setSaving(true)
      await superadminApi.createCompany(form)
      setForm(INITIAL_FORM)
      setShowForm(false)
      await loadEmpresas()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error creando empresa')
    } finally {
      setSaving(false)
    }
  }

  const toggleEmpresa = useCallback(async (id, currentlyActive) => {
    setToggling(id)
    try {
      if (currentlyActive) {
        await superadminApi.deactivateCompany(id)
      } else {
        await superadminApi.activateCompany(id)
      }
      setEmpresas(prev => prev.map(e => e.id === id ? { ...e, active: !currentlyActive } : e))
    } catch (err) {
      alert(`No se pudo actualizar la empresa: ${err.response?.data?.error || err.message}`)
    } finally {
      setToggling(null)
    }
  }, [])

  return (
    <div className="sa-page">

      <div className="sa-header">
        <h1 className="sa-title">Empresas</h1>
        <div className="sa-actions">
          <button
            className={`sa-card__btn ${showForm ? 'sa-card__btn--deactivate' : 'sa-card__btn--activate'}`}
            onClick={() => { setShowForm(p => !p); setFormError(null); setForm(INITIAL_FORM) }}
          >
            {showForm ? 'Cancelar' : '+ Crear empresa'}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{
          background: 'var(--iw-surface)',
          border: '1.5px solid var(--iw-border)',
          borderRadius: 'var(--iw-radius-md)',
          padding: '1.5rem'
        }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: 'var(--iw-font-size-xl)' }}>Nueva empresa</h2>

          {formError && (
            <p className="sa-error" role="alert" style={{ marginBottom: '1rem' }}>{formError}</p>
          )}

          <form onSubmit={handleSubmit}>

            {/* Datos de la empresa */}
            <p style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--iw-text-muted)', fontSize: 'var(--iw-font-size-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Datos de la empresa
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>

              <label style={labelStyle}>
                Nombre *
                <input name="name" value={form.name} onChange={handleChange} placeholder="Empresa S.L." required style={inputStyle} />
              </label>

              <label style={labelStyle}>
                Zona horaria
                <select name="timezone" value={form.timezone} onChange={handleChange} style={inputStyle}>
                  <option value="Europe/Madrid">Europe/Madrid</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                </select>
              </label>

              <label style={labelStyle}>
                Latitud oficina
                <input name="office_latitude" type="number" step="0.0001" value={form.office_latitude} onChange={handleChange} placeholder="43.2630" style={inputStyle} />
              </label>

              <label style={labelStyle}>
                Longitud oficina
                <input name="office_longitude" type="number" step="0.0001" value={form.office_longitude} onChange={handleChange} placeholder="-2.9350" style={inputStyle} />
              </label>

              <label style={labelStyle}>
                Radio geofencing (m)
                <input name="office_radius_m" type="number" value={form.office_radius_m} onChange={handleChange} placeholder="200" style={inputStyle} />
              </label>

            </div>

            {/* Datos del admin */}
            <p style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--iw-text-muted)', fontSize: 'var(--iw-font-size-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Administrador de la empresa
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>

              <label style={labelStyle}>
                Nombre del admin *
                <input name="admin_name" value={form.admin_name} onChange={handleChange} placeholder="Nombre del administrador" required style={inputStyle} />
              </label>

              <label style={labelStyle}>
                Email del admin *
                <input name="admin_email" type="email" value={form.admin_email} onChange={handleChange} placeholder="admin@empresa.com" required style={inputStyle} />
              </label>

              <label style={labelStyle}>
                Contraseña inicial *
                <input name="admin_password" type="password" value={form.admin_password} onChange={handleChange} placeholder="Contraseña del admin" required style={inputStyle} />
              </label>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(INITIAL_FORM); setFormError(null) }}
                style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--iw-radius-sm)', border: '1.5px solid var(--iw-border)', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'var(--iw-font-size-md)' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="sa-card__btn sa-card__btn--activate"
                style={{ padding: '0.6rem 1.25rem' }}
              >
                {saving ? 'Guardando...' : 'Crear empresa'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && <p className="sa-loading">Cargando empresas...</p>}
      {error     && <p className="sa-error" role="alert">{error}</p>}

      {!isLoading && !error && (
        <div className="sa-list" id="empresas-list">
          {empresas.length === 0
            ? <p className="sa-empty">No hay empresas registradas.</p>
            : empresas.map(e => (
                <EmpresaCard
                  key={e.id}
                  empresa={e}
                  onToggle={toggleEmpresa}
                  loading={toggling}
                />
              ))
          }
        </div>
      )}

    </div>
  )
}