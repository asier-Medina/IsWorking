import { useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../lib/adminApi'
import './Admin.css'

const INITIAL_FORM = {
  user_id: '',
  shift_template_id: '',
  work_date: ''
}

const STATUS_LABELS = {
  assigned: 'Asignado',
  confirmed: 'Confirmado',
  absent: 'Ausente'
}

const TYPE_LABELS = {
  morning: 'Mañana',
  afternoon: 'Tarde',
  split: 'Partido'
}

export default function Horarios() {
  const [schedules, setSchedules] = useState([])
  const [employees, setEmployees] = useState([])
  const [turnos, setTurnos] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const employeesById = useMemo(() => {
    return employees.reduce((acc, employee) => {
      acc[employee.id] = employee
      return acc
    }, {})
  }, [employees])

  const turnosById = useMemo(() => {
    return turnos.reduce((acc, turno) => {
      acc[turno.id] = turno
      return acc
    }, {})
  }, [turnos])

  const loadData = async () => {
    try {
      setError(null)
      setLoading(true)

      const [employeesRes, turnosRes, schedulesRes] = await Promise.all([
        adminApi.getEmployees(),
        adminApi.getShiftTemplates(),
        adminApi.getSchedules()
      ])

      const employeesData = employeesRes.data.data || employeesRes.data.users || employeesRes.data || []
      const turnosData = Array.isArray(turnosRes.data) ? turnosRes.data : turnosRes.data.data || []
      const schedulesData = Array.isArray(schedulesRes.data) ? schedulesRes.data : schedulesRes.data.data || []

      setEmployees(employeesData.filter(employee => employee.role !== 'superadmin'))
      setTurnos(turnosData)
      setSchedules(schedulesData)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error cargando horarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

      if (!form.user_id || !form.shift_template_id || !form.work_date) {
    setError('Empleado, turno y fecha son obligatorios')
    return
  }

  const selectedDate = new Date(`${form.work_date}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (selectedDate < today) {
    setError('La fecha no puede ser anterior a hoy')
    return
  }

  const payload = {
    user_id: Number(form.user_id),
    shift_template_id: Number(form.shift_template_id),
    work_date: form.work_date
  }

    try {
      setSaving(true)
      setError(null)

      await adminApi.createSchedule(payload)

      setForm(INITIAL_FORM)
      setShowForm(false)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error asignando horario')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (scheduleId, status) => {
    try {
      setError(null)

      await adminApi.updateScheduleStatus(scheduleId, status)

      setSchedules(prev =>
        prev.map(schedule =>
          schedule.id === scheduleId
            ? { ...schedule, status }
            : schedule
        )
      )
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error actualizando estado')
    }
  }

  const renderTurnoHorario = (turno) => {
    if (!turno) return '-'

    if (turno.type === 'split') {
      return `${turno.start_time} - ${turno.break_start || '-'} / ${turno.break_end || '-'} - ${turno.end_time}`
    }

    return `${turno.start_time} - ${turno.end_time}`
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Horarios</h1>
          <p>Asigna turnos a empleados por fecha.</p>
        </div>

        <button
          className="admin-btn"
          onClick={() => setShowForm(prev => !prev)}
        >
          {showForm ? 'Cerrar formulario' : 'Asignar turno'}
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
              Empleado
              <select
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
              >
                <option value="">Selecciona empleado</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} — {employee.email}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Turno
              <select
                name="shift_template_id"
                value={form.shift_template_id}
                onChange={handleChange}
              >
                <option value="">Selecciona turno</option>
                {turnos.map(turno => (
                  <option key={turno.id} value={turno.id}>
                    {turno.name} — {TYPE_LABELS[turno.type] || turno.type} — {renderTurnoHorario(turno)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Fecha
              <input
                name="work_date"
                type="date"
                value={form.work_date}
                onChange={handleChange}
              />
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
                {saving ? 'Guardando...' : 'Asignar turno'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <p>Cargando horarios...</p>
        ) : schedules.length === 0 ? (
          <p>No hay horarios asignados todavía.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Empleado</th>
                <th>Turno</th>
                <th>Horario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {schedules.map(schedule => {
                const employee = employeesById[schedule.user_id]
                const turno = turnosById[schedule.shift_template_id]

                return (
                  <tr key={schedule.id}>
                    <td>{schedule.work_date}</td>
                    <td>
                      {employee
                        ? `${employee.name} (${employee.email})`
                        : `Usuario #${schedule.user_id}`}
                    </td>
                    <td>
                      {turno ? (
                        <>
                          <strong>{turno.name}</strong>
                          <br />
                          <span className="admin-badge admin-badge--role">
                            {TYPE_LABELS[turno.type] || turno.type}
                          </span>
                        </>
                      ) : (
                        `Turno #${schedule.shift_template_id}`
                      )}
                    </td>
                    <td>{renderTurnoHorario(turno)}</td>
                    <td>
                      <span className="admin-badge admin-badge--role">
                        {STATUS_LABELS[schedule.status] || schedule.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn admin-btn--secondary"
                          disabled={schedule.status === 'assigned'}
                          onClick={() => handleStatusChange(schedule.id, 'assigned')}
                        >
                          Asignado
                        </button>

                        <button
                          className="admin-btn admin-btn--success"
                          disabled={schedule.status === 'confirmed'}
                          onClick={() => handleStatusChange(schedule.id, 'confirmed')}
                        >
                          Confirmar
                        </button>

                        <button
                          className="admin-btn admin-btn--danger"
                          disabled={schedule.status === 'absent'}
                          onClick={() => handleStatusChange(schedule.id, 'absent')}
                        >
                          Ausente
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
