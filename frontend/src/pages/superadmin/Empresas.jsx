import { useState, useEffect, useCallback } from "react";
import "./superadmin.css";

/**
 * Empresas — página de gestión de empresas para el superadmin.
 * Ruta: /superadmin/empresas
 *
 * Endpoints:
 *  GET   /api/companies       → lista de empresas
 *  PATCH /api/companies/:id   → { active: bool }
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

function EmpresaCard({ empresa, onToggle, loading }) {
  const isActive    = empresa.active !== false;
  const displayName = empresa.name ?? "Sin nombre";
  const initials    = displayName.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

  return (
    <article
      className={`sa-card ${isActive ? "sa-card--active" : "sa-card--inactive"}`}
      aria-label={`${displayName}, ${isActive ? "activa" : "inactiva"}`}
    >
      <div className="sa-card__logo" aria-hidden="true">
        {empresa.logo
          ? <img src={empresa.logo} alt={`Logo ${displayName}`} className="sa-card__logo-img" />
          : <span className="sa-card__logo-initials">{initials}</span>
        }
      </div>

      <div className="sa-card__info">
        <p className="sa-card__name">{displayName}</p>
        {empresa.sector && <p className="sa-card__subtitle">{empresa.sector}</p>}
      </div>

      <span
        className={`sa-card__badge ${isActive ? "sa-card__badge--active" : "sa-card__badge--inactive"}`}
        aria-label={`Estado: ${isActive ? "activa" : "inactiva"}`}
      >
        {isActive ? "ACTIVA" : "INACTIVA"}
      </span>

      <div className="sa-card__actions">
        <button
          className={`sa-card__btn ${isActive ? "sa-card__btn--deactivate" : "sa-card__btn--activate"}`}
          onClick={() => onToggle(empresa.id, !isActive)}
          disabled={loading === empresa.id}
          aria-label={`${isActive ? "Desactivar" : "Activar"} empresa ${displayName}`}
        >
          {loading === empresa.id ? "Procesando..." : isActive ? "Desactivar empresa" : "Activar empresa"}
        </button>
      </div>
    </article>
  );
}

export default function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const [toggling, setToggling]   = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/companies`, { headers: authHeaders() })
      .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
      .then((data) => setEmpresas(data.datos ?? data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const toggleEmpresa = useCallback(async (id, active) => {
    setToggling(id);
    try {
      const res = await fetch(`${API_URL}/api/companies/${id}`, {
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
      setToggling(null);
    }
  }, []);

  return (
    <div className="sa-page">

      <div className="sa-header">
        <h1 className="sa-title">Empresas</h1>
        <div className="sa-actions">
          <button
            className="iw-btn iw-btn--primary sa-action-btn"
            onClick={() => alert("Crear empresa — pendiente de implementar")}
          >
            Crear empresa nueva
          </button>
          <button
            className="iw-btn iw-btn--ghost sa-action-btn"
            onClick={() => exportToCSV(empresas, "empresas")}
          >
            Exportar a CSV
          </button>
          <button
            className="iw-btn iw-btn--ghost sa-action-btn"
            onClick={() => exportToPDF("empresas-list", "Empresas")}
          >
            Exportar a PDF
          </button>
        </div>
      </div>

      {isLoading && <p className="sa-loading" role="status">Cargando empresas...</p>}
      {error     && <p className="sa-error"   role="alert">{error}</p>}

      {!isLoading && !error && (
        <div className="sa-list" id="empresas-list" aria-label="Lista de empresas">
          {empresas.length === 0
            ? <p className="sa-empty">No hay empresas registradas.</p>
            : empresas.map((e) => (
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
  );
}