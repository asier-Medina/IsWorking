import { useEffect, useState } from 'react'
import { adminApi } from '../../lib/adminApi'
import { useAuth } from '../../context/AuthContext'
import './Admin.css'

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'employee',
  remote_allowed: false
}

export default function Empleados() {
  const { user } = useAuth()

  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const loadEmployees = async () => {
    try {
      setError(null)
      setLoading(true)

      const { data } = await adminApi.getEmployees()
      setEmployees(data.data || data.users || data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error cargando empleados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.password) {
      setError('Nombre, email y contraseña son obligatorios')
      return
    }

    try {
      setSaving(true)
      setError(null)

      await adminApi.createEmployee(form)

      setForm(INITIAL_FORM)
      setShowForm(false)
      await loadEmployees()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error creando empleado')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (employee) => {
    const nextStatus = !employee.active

    try {
      setError(null)
      await adminApi.setEmployeeStatus(employee.id, nextStatus)

      setEmployees(prev =>
        prev.map(item =>
          item.id === employee.id
            ? { ...item, active: nextStatus }
            : item
        )
      )
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error cambiando estado')
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Empleados</h1>
          <p>Gestiona los empleados de tu empresa.</p>
        </div>

        <button
          className="admin-btn"
          onClick={() => setShowForm(prev => !prev)}
        >
          {showForm ? 'Cerrar formulario' : 'Crear empleado'}
        </button>
      </header>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {showForm && (
        <div className="admin-card">
          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              Nombre
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nombre del empleado"
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="empleado@empresa.com"
              />
            </label>

            <label>
              Contraseña
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Contraseña inicial"
              />
            </label>

            <label>
              Rol
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="employee">Empleado</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label>
              Permitir remoto
              <select
                name="remote_allowed"
                value={String(form.remote_allowed)}
                onChange={(e) =>
                  setForm(prev => ({
                    ...prev,
                    remote_allowed: e.target.value === 'true'
                  }))
                }
              >
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </label>

            <div className="admin-form__actions">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => {
                  setShowForm(false)
                  setForm(INITIAL_FORM)
                }}
              >
                Cancelar
              </button>

              <button className="admin-btn" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar empleado'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <p>Cargando empleados...</p>
        ) : employees.length === 0 ? (
          <p>No hay empleados todavía.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Remoto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {employees.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>
                    <span className="admin-badge admin-badge--role">
                      {employee.role}
                    </span>
                  </td>
                  <td>{employee.remote_allowed ? 'Sí' : 'No'}</td>
                  <td>
                    <span className={`admin-badge ${employee.active ? 'admin-badge--active' : 'admin-badge--inactive'}`}>
                      {employee.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      {employee.id === user?.id ? (
                        <span className="admin-badge admin-badge--role">
                          Usuario actual
                        </span>
                      ) : employee.role === 'superadmin' ? (
                        <span className="admin-badge admin-badge--role">
                          Superadmin
                        </span>
                      ) : (
                        <button
                          className={`admin-btn ${employee.active ? 'admin-btn--danger' : 'admin-btn--success'}`}
                          onClick={() => handleToggleStatus(employee)}
                        >
                          {employee.active ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
