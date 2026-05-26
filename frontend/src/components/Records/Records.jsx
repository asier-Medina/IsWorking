import "./Records.css";

/**
 * Records — card de fichajes del día
 *
 * Props:
 *  - user:    { nombre, email, rol }  datos del usuario del backend
 *  - records: [{ type, createdAt }]   fichajes acumulados desde Clock
 *
 * Tipos de fichaje (backend):
 *  entry | break_start | break_end | exit
 */

const TYPE_LABELS = {
  entry:       "Entrada",
  break_start: "Inicio pausa",
  break_end:   "Fin pausa",
  exit:        "Salida",
};

const formatHour = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/* Calcula horas trabajadas descontando pausas */
const calcTotalHours = (records) => {
  const entry = records.find((r) => r.type === "entry");
  const exit  = records.find((r) => r.type === "exit");
  if (!entry || !exit) return null;

  let totalMs = new Date(exit.createdAt) - new Date(entry.createdAt);

  const breakStarts = records.filter((r) => r.type === "break_start");
  const breakEnds   = records.filter((r) => r.type === "break_end");

  breakStarts.forEach((bs, i) => {
    const be = breakEnds[i];
    if (be) {
      totalMs -= new Date(be.createdAt) - new Date(bs.createdAt);
    }
  });

  const totalMins = Math.round(totalMs / 60000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

/* Genera iniciales del nombre (máx. 2 palabras) */
const getInitials = (nombre = "") =>
  nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

export default function Records({ user = null, records = [] }) {
  const today      = records[0]?.createdAt ?? new Date().toISOString();
  const totalHours = calcTotalHours(records);
  const initials   = getInitials(user?.nombre);

  return (
    <article className="records" aria-label="Resumen de fichajes del día">

      {/* Sección de datos del usuario */}
      <section className="records__user" aria-label="Datos del usuario">
        <h2 className="records__section-title">Mis datos</h2>

        <div className="records__user-info">
          <div className="records__avatar" aria-hidden="true">
            {initials || "?"}
          </div>
          <div className="records__user-text">
            {user ? (
              <>
                <span className="records__user-name">{user.nombre}</span>
                <span className="records__user-email">{user.email}</span>
                <span className="records__user-role">{user.rol}</span>
              </>
            ) : (
              <span className="records__user-empty">Sin sesión iniciada</span>
            )}
          </div>
        </div>
      </section>

      <hr className="records__divider" />

      {/* Sección de fichajes */}
      <section className="records__fichajes" aria-label="Fichajes del día">
        <h2 className="records__section-title">Fichajes</h2>

        {records.length === 0 ? (
          <p className="records__empty">No hay fichajes registrados hoy.</p>
        ) : (
          <table className="records__table" aria-label="Tabla de fichajes">
            <tbody>

              {/* Fecha */}
              <tr className="records__row">
                <td className="records__label">Fecha</td>
                <td className="records__value">{formatDate(today)}</td>
              </tr>

              {/* Una fila por cada fichaje */}
              {records.map((record, index) => (
                <tr key={index} className="records__row">
                  <td className="records__label">
                    {TYPE_LABELS[record.type] ?? record.type}
                  </td>
                  <td className="records__value">
                    {formatHour(record.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Total horas */}
      {totalHours && (
        <>
          <hr className="records__divider" />
          <div className="records__total" aria-label={`Total horas trabajadas: ${totalHours}`}>
            <span className="records__total-label">TOTAL HORAS</span>
            <span className="records__total-value">{totalHours}</span>
          </div>
        </>
      )}

    </article>
  );
}