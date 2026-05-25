import { useState, useEffect, useCallback } from "react";
import "./AdminDashboard.css";

/**
 * AdminDashboard — página del superadmin.
 *
 * Modelo User (backend):
 *  id, company_id, name, email, role, active, remote_allowed, created_at
 *
 * Endpoints:
 *  GET   /api/empresas       → lista de empresas
 *  GET   /api/usuarios       → lista de usuarios (requiere rol admin)
 *  PATCH /api/empresas/:id   → { active: bool }
 *  PATCH /api/usuarios/:id   → { active: bool }
 */

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/* Exporta a CSV cualquier array de objetos */
const exportToCSV = (data, filename) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows    = data.map((row) =>
    Object.values(row)
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv  = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

/* Exporta a PDF usando la ventana de impresión del navegador */
const exportToPDF = (sectionId, filename) => {
  const section = document.getElementById(sectionId);
  if (!section) return;
  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; color: #1a1a2e; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
          th { background: #3e35a8; color: white; }
        </style>
      </head>
      <body>${section.innerHTML}</body>
    </html>
  `);
  win.document.close();
  win.print();
};

/* Card reutilizable para empresa y usuario */
function EntityCard({ entity, type, onToggle, loading }) {
  const isActive    = entity.active !== false;
  const logoSrc     = entity.logo ?? entity.avatar ?? null;
  const displayName = entity.name ?? "Sin nombre";

  /* Subtítulo: email para usuarios, sector para empresas */
  const subtitle = type === "usuario"
    ? entity.email
    : entity.sector ?? entity.email ?? null;

  /* Rol traducido (solo en usuarios) */
  const roleLabel = type === "usuario" ? entity.role : null;

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <article
      className={`ad-card ${isActive ? "ad-card--active" : "ad-card--inactive"}`}
      aria-label={`${displayName}, ${isActive ? "activo" : "inactivo"}`}
    >
      {/* Logo o avatar */}
      <div className="ad-card__logo" aria-hidden="true">
        {logoSrc ? (
          <img src={logoSrc} alt={`Logo de ${displayName}`} className="ad-card__logo-img" />
        ) : (
          <span className="ad-card__logo-initials">{initials}</span>
        )}
      </div>

      {/* Info */}
      <div className="ad-card__info">
        <p className="ad-card__name">{displayName}</p>
        {subtitle   && <p className="ad-card__subtitle">{subtitle}</p>}
        {roleLabel  && <p className="ad-card__role">{roleLabel}</p>}
      </div>

      {/* Badge de estado */}
      <span
        className={`ad-card__badge ${isActive ? "ad-card__badge--active" : "ad-card__badge--inactive"}`}
        aria-label={`Estado: ${isActive ? "activo" : "inactivo"}`}
      >
        {isActive ? "ACTIVO" : "INACTIVO"}
      </span>

      {/* Botón de acción */}
      <div className="ad-card__actions">
        <button
          className={`ad-card__btn ${isActive ? "ad-card__btn--deactivate" : "ad-card__btn--activate"}`}
          onClick={() => onToggle(entity.id, !isActive)}
          disabled={loading === entity.id}
          aria-label={`${isActive ? "Desactivar" : "Activar"} ${type} ${displayName}`}
        >
          {loading === entity.id
            ? "Procesando..."
            : isActive
              ? `Desactivar ${type}`
              : `Activar ${type}`}
        </button>
      </div>
    </article>
  );
}

/* Sección reutilizable (empresas / usuarios) */
function DashboardSection({
  id, title, items, type,
  loadingItem, isLoading, error,
  onToggle, onCreateNew,
  csvFilename, pdfFilename,
}) {
  return (
    <section className="ad-section" id={id} aria-labelledby={`${id}-title`}>

      <div className="ad-section__header">
        <h2 className="ad-section__title" id={`${id}-title`}>{title}</h2>
        <div className="ad-section__actions">
          <button
            className="iw-btn iw-btn--primary ad-section__action-btn"
            onClick={onCreateNew}
          >
            {type === "empresa" ? "Crear empresa nueva" : "Crear nuevo usuario"}
          </button>
          <button
            className="iw-btn iw-btn--ghost ad-section__action-btn"
            onClick={() => exportToCSV(items, csvFilename)}
          >
            Exportar a CSV
          </button>
          <button
            className="iw-btn iw-btn--ghost ad-section__action-btn"
            onClick={() => exportToPDF(`${id}-list`, pdfFilename)}
          >
            Exportar a PDF
          </button>
        </div>
      </div>

      {isLoading && (
        <p className="ad-section__loading" role="status" aria-live="polite">
          Cargando {title.toLowerCase()}...
        </p>
      )}
      {error && (
        <p className="ad-section__error" role="alert">{error}</p>
      )}

      {!isLoading && !error && (
        <div className="ad-list" id={`${id}-list`}>
          {items.length === 0 ? (
            <p className="ad-section__empty">
              No hay {title.toLowerCase()} registradas.
            </p>
          ) : (
            items.map((item) => (
              <EntityCard
                key={item.id}
                entity={item}
                type={type}
                onToggle={onToggle}
                loading={loadingItem}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}

export default function AdminDashboard() {
  const [empresas, setEmpresas]               = useState([]);
  const [usuarios, setUsuarios]               = useState([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [errorEmpresas, setErrorEmpresas]     = useState(null);
  const [errorUsuarios, setErrorUsuarios]     = useState(null);
  const [togglingItem, setTogglingItem]       = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/empresas`, { headers: authHeaders() })
      .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
      .then((data) => setEmpresas(data.datos ?? data))
      .catch((err) => setErrorEmpresas(err.message))
      .finally(() => setLoadingEmpresas(false));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/usuarios`, { headers: authHeaders() })
      .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
      .then((data) => setUsuarios(data.datos ?? data))
      .catch((err) => setErrorUsuarios(err.message))
      .finally(() => setLoadingUsuarios(false));
  }, []);

  const toggleEmpresa = useCallback(async (id, active) => {
    setTogglingItem(id);
    try {
      const res = await fetch(`${API_URL}/api/empresas/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const updated = await res.json();
      setEmpresas((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    } catch (err) {
      alert(`No se pudo actualizar la empresa: ${err.message}`);
    } finally {
      setTogglingItem(null);
    }
  }, []);

  const toggleUsuario = useCallback(async (id, active) => {
    setTogglingItem(id);
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const updated = await res.json();
      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
    } catch (err) {
      alert(`No se pudo actualizar el usuario: ${err.message}`);
    } finally {
      setTogglingItem(null);
    }
  }, []);

  return (
    <div className="ad-page">
      <nav className="ad-nav" aria-label="Navegación de secciones">
        <a href="#empresas" className="ad-nav__link">Empresas</a>
        <a href="#usuarios" className="ad-nav__link">Usuarios</a>
      </nav>

      <DashboardSection
        id="empresas" title="Empresas" items={empresas} type="empresa"
        loadingItem={togglingItem} isLoading={loadingEmpresas} error={errorEmpresas}
        onToggle={toggleEmpresa}
        onCreateNew={() => alert("Crear empresa — pendiente de implementar")}
        csvFilename="empresas" pdfFilename="Empresas"
      />

      <DashboardSection
        id="usuarios" title="Usuarios" items={usuarios} type="usuario"
        loadingItem={togglingItem} isLoading={loadingUsuarios} error={errorUsuarios}
        onToggle={toggleUsuario}
        onCreateNew={() => alert("Crear usuario — pendiente de implementar")}
        csvFilename="usuarios" pdfFilename="Usuarios"
      />
    </div>
  );
}