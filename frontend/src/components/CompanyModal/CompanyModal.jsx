import { useState, useEffect, useRef } from "react";
import "./CompanyModal.css";

/**
 * CompanyModal — modal para crear una empresa nueva.
 *
 * Clases de index.css usadas:
 *  .iw-modal-overlay  .iw-modal-card   .iw-modal-header
 *  .iw-modal-title    .iw-modal-close  .iw-modal-body
 *  .iw-modal-footer   .iw-field        .iw-field-group
 *  .iw-label          .iw-input        .iw-select
 *  .iw-hint           .iw-form-error   .iw-btn
 *
 * Campos del modelo Company (backend):
 *  name             STRING(100)   required
 *  timezone         STRING(50)    default: 'Europe/Madrid'
 *  office_latitude  DECIMAL(9,6)  optional
 *  office_longitude DECIMAL(9,6)  optional
 *  office_radius_m  INTEGER       default: 200
 *
 * Props:
 *  isOpen:    boolean
 *  onClose:   () => void
 *  onSuccess: (company) => void
 */

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const TIMEZONES = [
  "Europe/Madrid", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Europe/Lisbon", "America/New_York", "America/Chicago",
  "America/Los_Angeles", "America/Mexico_City", "America/Bogota",
  "America/Buenos_Aires", "America/Sao_Paulo", "Asia/Tokyo",
  "Asia/Shanghai", "Asia/Dubai", "Pacific/Auckland", "UTC",
];

const INITIAL = {
  name: "", timezone: "Europe/Madrid",
  office_latitude: "", office_longitude: "", office_radius_m: 200,
};

export default function CompanyModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm]       = useState(INITIAL);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);
  const firstInputRef         = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm(INITIAL);
    setError(null);
    setTimeout(() => firstInputRef.current?.focus(), 50);
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    const body  = {
      name:     form.name.trim(),
      timezone: form.timezone,
      ...(form.office_latitude  !== "" && { office_latitude:  parseFloat(form.office_latitude) }),
      ...(form.office_longitude !== "" && { office_longitude: parseFloat(form.office_longitude) }),
      office_radius_m: parseInt(form.office_radius_m, 10) || 200,
    };
    try {
      const res = await fetch(`${API_URL}/api/companies`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      onSuccess(await res.json());
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="iw-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cm-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="iw-modal-card">

        {/* Cabecera */}
        <div className="iw-modal-header">
          <h2 className="iw-modal-title" id="cm-title">Nueva empresa</h2>
          <button className="iw-modal-close" onClick={onClose} aria-label="Cerrar modal">
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form className="iw-modal-body" onSubmit={handleSubmit} noValidate>

          {/* Nombre */}
          <div className="iw-field">
            <label className="iw-label" htmlFor="cm-name">
              Nombre de la empresa
              <span className="iw-label__required" aria-hidden="true"> *</span>
            </label>
            <input
              ref={firstInputRef}
              id="cm-name"
              className="iw-input"
              type="text"
              name="name"
              placeholder="Ej: Acme S.L."
              value={form.name}
              onChange={handleChange}
              required
              maxLength={100}
              autoComplete="organization"
            />
          </div>

          {/* Zona horaria */}
          <div className="iw-field">
            <label className="iw-label" htmlFor="cm-timezone">Zona horaria</label>
            <select
              id="cm-timezone"
              className="iw-input iw-select"
              name="timezone"
              value={form.timezone}
              onChange={handleChange}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          {/* Coordenadas GPS */}
          <div className="iw-field-group">
            <div className="iw-field">
              <label className="iw-label" htmlFor="cm-lat">Latitud de oficina</label>
              <input
                id="cm-lat"
                className="iw-input"
                type="number"
                name="office_latitude"
                placeholder="Ej: 40.416775"
                value={form.office_latitude}
                onChange={handleChange}
                step="0.000001"
                min="-90"
                max="90"
              />
            </div>
            <div className="iw-field">
              <label className="iw-label" htmlFor="cm-lng">Longitud de oficina</label>
              <input
                id="cm-lng"
                className="iw-input"
                type="number"
                name="office_longitude"
                placeholder="Ej: -3.703790"
                value={form.office_longitude}
                onChange={handleChange}
                step="0.000001"
                min="-180"
                max="180"
              />
            </div>
          </div>

          {/* Radio de fichaje */}
          <div className="iw-field">
            <label className="iw-label" htmlFor="cm-radius">
              Radio de fichaje (metros)
            </label>
            <input
              id="cm-radius"
              className="iw-input"
              type="number"
              name="office_radius_m"
              placeholder="200"
              value={form.office_radius_m}
              onChange={handleChange}
              min="10"
              max="10000"
              step="10"
            />
            <span className="iw-hint">
              Distancia máxima desde la oficina para fichar en modo presencial.
            </span>
          </div>

          {/* Error */}
          {error && <p className="iw-form-error" role="alert">{error}</p>}

          {/* Botones */}
          <div className="iw-modal-footer">
            <button
              type="button"
              className="iw-btn cm-btn--cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="iw-btn iw-btn--primary"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear empresa"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}