import { useEffect, useState } from 'react'
import { adminApi } from '../../lib/adminApi'
import './Admin.css'

const INITIAL_FORM = {
  name: '',
  type: 'morning',
  start_time: '',
  end_time: '',
  has_break: false,
  break_start: '',
  break_end: ''
}

const TYPE_LABELS = {
  morning: 'Mañana',
  afternoon: 'Tarde',
  split: 'Partido'
}

export default function Turnos() {
  const [turnos, setTurnos] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isSplit = form.type === 'split'

  const loadTurnos = async () => {
    try {
      setError(null)
      setLoading(true)

      const { data } = await adminApi.getShiftTemplates()
      setTurnos(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error cargando turnos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTurnos()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm(prev => {
      const nextForm = {
        ...prev,
        [name]: value
      }

      if (name === 'type') {
        if (value === 'split') {
          nextForm.has_break = true
        } else {
          nextForm.has_break = false
          nextForm.break_start = ''
          nextForm.break_end = ''
        }
      }

      return nextForm
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.type || !form.start_time || !form.end_time) {
      setError('Nombre, tipo, hora de inicio y hora de fin son obligatorios')
      return
    }

    if (form.type === 'split' && (!form.break_start || !form.break_end)) {
      setError('En un turno partido debes indicar salida del primer tramo y entrada del segundo tramo')
      return
    }

    const payload = {
      name: form.name,
      type: form.type,
      start_time: form.start_time,
      end_time: form.end_time,
      has_break: form.type === 'split',
      break_start: form.type === 'split' ? form.break_start : null,
      break_end: form.type === 'split' ? form.break_end : null
    }

    try {
      setSaving(true)
      setError(null)

      await adminApi.createShiftTemplate(payload)

      setForm(INITIAL_FORM)
      setShowForm(false)
      await loadTurnos()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error creando turno')
    } finally {
      setSaving(false)
    }
  }

  const renderHorario = (turno) => {
    if (turno.type === 'split') {
      return (
        <>
          <strong>Tramo 1:</strong> {turno.start_time} - {turno.break_start || '-'}
          <br />
          <strong>Tramo 2:</strong> {turno.break_end || '-'} - {turno.end_time}
        </>
      )
    }

    return `${turno.start_time} - ${turno.end_time}`
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Turnos</h1>
          <p>Crea y consulta las plantillas de turno de tu empresa.</p>
        </div>

        <button
          className="admin-btn"
          onClick={() => setShowForm(prev => !prev)}
        >
          {showForm ? 'Cerrar formulario' : 'Crear turno'}
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
              Nombre del turno
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={isSplit ? 'Turno Partido' : 'Turno Mañana'}
              />
            </label>

            <label>
              Tipo
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="morning">Mañana</option>
                <option value="afternoon">Tarde</option>
                <option value="split">Partido</option>
              </select>
            </label>

            <label>
              {isSplit ? 'Entrada 1' : 'Hora inicio'}
              <input
                name="start_time"
                type="time"
                value={form.start_time}
                onChange={handleChange}
              />
            </label>

            {isSplit && (
              <label>
                Salida 1
                <input
                  name="break_start"
                  type="time"
                  value={form.break_start}
                  onChange={handleChange}
                />
              </label>
            )}

            {isSplit && (
              <label>
                Entrada 2
                <input
                  name="break_end"
                  type="time"
                  value={form.break_end}
                  onChange={handleChange}
                />
              </label>
            )}

            <label>
              {isSplit ? 'Salida 2' : 'Hora fin'}
              <input
                name="end_time"
                type="time"
                value={form.end_time}
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
                {saving ? 'Guardando...' : 'Guardar turno'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <p>Cargando turnos...</p>
        ) : turnos.length === 0 ? (
          <p>No hay plantillas de turno todavía.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Horario</th>
              </tr>
            </thead>

            <tbody>
              {turnos.map(turno => (
                <tr key={turno.id}>
                  <td>{turno.name}</td>
                  <td>
                    <span className="admin-badge admin-badge--role">
                      {TYPE_LABELS[turno.type] || turno.type}
                    </span>
                  </td>
                  <td>{renderHorario(turno)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
