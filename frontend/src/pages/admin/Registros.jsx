import { useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../lib/adminApi'
import './Admin.css'

const TYPE_LABELS = {
  entry: 'Entrada',
  break_start: 'Inicio pausa',
  break_end: 'Fin pausa',
  exit: 'Salida'
}

const MODE_LABELS = {
  office: 'Oficina',
  remote: 'Remoto'
}

export default function Registros() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    mode: '',
    date: ''
  })

  const employeesById = useMemo(() => {
    return employees.reduce((acc, employee) => {
      acc[employee.id] = employee
      return acc
    }, {})
  }, [employees])

  const loadData = async () => {
    try {
      setError(null)
      setLoading(true)

      const [recordsRes, employeesRes] = await Promise.all([
        adminApi.getRecords(),
        adminApi.getEmployees()
      ])

      const recordsData = Array.isArray(recordsRes.data)
        ? recordsRes.data
        : recordsRes.data.data || []

      const employeesData = employeesRes.data.data || employeesRes.data.users || employeesRes.data || []

      setRecords(recordsData)
      setEmployees(employeesData)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error cargando registros')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleFilterChange = (e) => {
    const { name, value } = e.target

    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const employee = employeesById[record.user_id]
      const employeeText = `${employee?.name || ''} ${employee?.email || ''}`.toLowerCase()
      const search = filters.search.trim().toLowerCase()

      const recordDate = record.timestamp
        ? new Date(record.timestamp).toISOString().slice(0, 10)
        : ''

      if (search && !employeeText.includes(search)) return false
      if (filters.type && record.type !== filters.type) return false
      if (filters.mode && record.mode !== filters.mode) return false
      if (filters.date && recordDate !== filters.date) return false

      return true
    })
  }, [records, employeesById, filters])

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '-'

    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(timestamp))
  }

  const formatLocation = (record) => {
    if (!record.latitude || !record.longitude) return '-'

    return `${Number(record.latitude).toFixed(5)}, ${Number(record.longitude).toFixed(5)}`
  }

  const openMap = (record) => {
    if (!record.latitude || !record.longitude) return

    const url = `https://www.google.com/maps?q=${record.latitude},${record.longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Registros</h1>
          <p>Consulta los fichajes realizados por los empleados de tu empresa.</p>
        </div>

        <button className="admin-btn" onClick={loadData}>
          Actualizar
        </button>
      </header>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-form">
          <label>
            Buscar empleado
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Nombre o email"
            />
          </label>

          <label>
            Tipo
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="entry">Entrada</option>
              <option value="break_start">Inicio pausa</option>
              <option value="break_end">Fin pausa</option>
              <option value="exit">Salida</option>
            </select>
          </label>

          <label>
            Modalidad
            <select
              name="mode"
              value={filters.mode}
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              <option value="office">Oficina</option>
              <option value="remote">Remoto</option>
            </select>
          </label>

          <label>
            Fecha
            <input
              name="date"
              type="date"
              value={filters.date}
              onChange={handleFilterChange}
            />
          </label>

          <div className="admin-form__actions">
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={() => setFilters({ search: '', type: '', mode: '', date: '' })}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <p>Cargando registros...</p>
        ) : filteredRecords.length === 0 ? (
          <p>No hay registros con esos filtros.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha y hora</th>
                <th>Empleado</th>
                <th>Tipo</th>
                <th>Modalidad</th>
                <th>Ubicación</th>
                <th>Precisión</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map(record => {
                const employee = employeesById[record.user_id]

                return (
                  <tr key={record.id}>
                    <td>{formatDateTime(record.timestamp)}</td>

                    <td>
                      {employee ? (
                        <>
                          <strong>{employee.name}</strong>
                          <br />
                          <span>{employee.email}</span>
                        </>
                      ) : (
                        `Usuario #${record.user_id}`
                      )}
                    </td>

                    <td>
                      <span className="admin-badge admin-badge--role">
                        {TYPE_LABELS[record.type] || record.type}
                      </span>
                    </td>

                    <td>{MODE_LABELS[record.mode] || record.mode}</td>

                    <td>{formatLocation(record)}</td>

                    <td>
                      {record.accuracy ? `${record.accuracy} m` : '-'}
                    </td>

                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn admin-btn--secondary"
                          disabled={!record.latitude || !record.longitude}
                          onClick={() => openMap(record)}
                        >
                          Ver mapa
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
