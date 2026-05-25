import { useState, useEffect, useCallback } from "react";
import "./superadmin.css";

/**
 * Usuarios — página de gestión de usuarios para el superadmin.
 * Ruta: /superadmin/usuarios
 *
 * Endpoints:
 *  GET   /api/companies       → para cruzar company_id → nombre de empresa
 *  GET   /api/users           → lista de usuarios (requiere rol admin/superadmin)
 *  PATCH /api/users/:id       → { active: bool }
 *
 * Modelo User: { id, company_id, name, email, role, active, remote_allowed }
 */

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const exportToCSV = (data, filename) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows    = data.map((row) =>
    Object.values(row).map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
  );
  const blob = new Blob([[headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = `${filename}.csv`; link.click();
  URL.revokeObjectURL(url);
};

const exportToPDF = (listId, title) => {
  const el  = document.getElementById(listId);
  if (!el) return;
  const win = window.open("", "_blank");
  win.document.write(`<html><head><title>${title}</title>
    <style>body{font-family:sans-serif;padding:2rem;color:#1a1a2e}
    table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #ddd;padding:.5rem;text-align:left}
    th{background:#3e35a8;color:white}</style>
    </head><body>${el.innerHTML}</body></html>`);
  win.document.close(); win.print();
};

function UsuarioCard({ usuario, companyName, onToggle, loading }) {
  const isActive    = usuario.active !== false;
  const displayName = usuario.name ?? "Sin nombre";
  const initials    = displayName.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

  return (
    <article
      className={`sa-card ${isActive ? "sa-card--active" : "sa-card--inactive"}`}
      aria-label={`${displayName}, ${isActive ? "activo" : "inactivo"}`}
    >
      <div className="sa-card__logo" aria-hidden="true">
        {usuario.avatar
          ? <img src={usuario.avatar} alt={displayName} className="sa-card__logo-img" />
          : <span className="sa-card__logo-initials">{initials}</span>
        }
      </div>

      <div className="sa-card__info">
        <p className="sa-card__name">{displayName}</p>
        <p className="sa-card__subtitle">
          {companyName ?? `Empresa #${usuario.company_id}`}
        </p>
      </div>

      <span
        className={`sa-card__badge ${isActive ? "sa-card__badge--active" : "sa-card__badge--inactive"}`}
        aria-label={`Estado: ${isActive ? "activo" : "inactivo"}`}
      >
        {isActive ? "ACTIVO" : "INACTIVO"}
      </span>

      <div className="sa-card__actions">
        <button
          className={`sa-card__btn ${isActive ? "sa-card__btn--deactivate" : "sa-card__btn--activate"}`}
          onClick={() => onToggle(usuario.id, !isActive)}
          disabled={loading === usuario.id}
          aria-label={`${isActive ? "Desactivar" : "Activar"} usuario ${displayName}`}
        >
          {loading === usuario.id ? "Procesando..." : isActive ? "Desactivar usuario" : "Activar usuario"}
        </button>
      </div>
    </article>
  );
}

export default function Usuarios() {
  const [usuarios, setUsuarios]   = useState([]);
  const [empresas, setEmpresas]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const [toggling, setToggling]   = useState(null);

  useEffect(() => {
    /* Carga usuarios y empresas en paralelo */
    Promise.all([
      fetch(`${API_URL}/api/users`,     { headers: authHeaders() }).then((r) => r.json()),
      fetch(`${API_URL}/api/companies`, { headers: authHeaders() }).then((r) => r.json()),
    ])
      .then(([usersData, companiesData]) => {
        setUsuarios(usersData.datos   ?? usersData);
        setEmpresas(companiesData.datos ?? companiesData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  /* Mapa id → nombre de empresa para búsqueda O(1) */
  const empresaMap = Object.fromEntries(
    empresas.map((e) => [e.id, e.name ?? `Empresa #${e.id}`])
  );

  const toggleUsuario = useCallback(async (id, active) => {
    setToggling(id);
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
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
      setToggling(null);
    }
  }, []);

  return (
    <div className="sa-page">

      <div className="sa-header">
        <h1 className="sa-title">Usuarios</h1>
        <div className="sa-actions">
          <button
            className="iw-btn iw-btn--ghost sa-action-btn"
            onClick={() => exportToCSV(usuarios, "usuarios")}
          >
            Exportar a CSV
          </button>
          <button
            className="iw-btn iw-btn--ghost sa-action-btn"
            onClick={() => exportToPDF("usuarios-list", "Usuarios")}
          >
            Exportar a PDF
          </button>
        </div>
      </div>

      {isLoading && <p className="sa-loading" role="status">Cargando usuarios...</p>}
      {error     && <p className="sa-error"   role="alert">{error}</p>}

      {!isLoading && !error && (
        <div className="sa-list" id="usuarios-list" aria-label="Lista de usuarios">
          {usuarios.length === 0
            ? <p className="sa-empty">No hay usuarios registrados.</p>
            : usuarios.map((u) => (
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
  );
}