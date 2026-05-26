import { useState, useEffect, useRef } from "react";
import api from "../../lib/api";
import "./Clock.css";

/**
 * Clock — componente de fichaje conectado al backend.
 *
 * Endpoint: POST /api/records
 * Auth:     cookie httpOnly (access_token), vía cliente api + withCredentials
 * Tipos:    entry | break_start | break_end | exit
 *
 * Props:
 *  - mode:     "office" | "remote"
 *  - onRecord: (record) => void  callback con la respuesta del backend
 */

const ICONS8 = (name, size = 48) =>
  `https://img.icons8.com/ios/${size}/ffffff/${name}.png`;

const ICONS = {
  enter: ICONS8("enter-2"),
  exit: ICONS8("exit"),
  pause: ICONS8("pause-button"),
  play: ICONS8("play-button-circled"),
  clock: ICONS8("clock", 32),
  coffee: ICONS8("coffee-to-go"),
};

const WORK_DAY_SECONDS = 8 * 60 * 60;
const RING_RADIUS = 70;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const pad = (n) => String(n).padStart(2, "0");
const formatTime = (s) =>
  `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;

const getLocation = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      return resolve(null);
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        });
      },
      () => {
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  });

const postRecord = async (type, mode = "office") => {
  const location = await getLocation();
  const { data } = await api.post("/records", { type, mode, ...(location ?? {}) });
  return data;
};

/** Mapea el último fichaje del día al estado de la UI. */
const lastTypeToUiStatus = (lastType) => {
  if (!lastType || lastType === "exit") return "idle";
  if (lastType === "break_start") return "break";
  return "working";
};

/** Suma segundos trabajados/descanso a partir de los fichajes de hoy. */
const computeElapsedSeconds = (todayRecords = []) => {
  let work = 0;
  let breakTime = 0;
  let workStart = null;
  let breakStart = null;
  const now = Date.now();

  for (const r of todayRecords) {
    const t = new Date(r.timestamp).getTime();
    switch (r.type) {
      case "entry":
        workStart = t;
        breakStart = null;
        break;
      case "break_start":
        if (workStart) work += (t - workStart) / 1000;
        workStart = null;
        breakStart = t;
        break;
      case "break_end":
        if (breakStart) breakTime += (t - breakStart) / 1000;
        breakStart = null;
        workStart = t;
        break;
      case "exit":
        if (workStart) work += (t - workStart) / 1000;
        workStart = null;
        if (breakStart) breakTime += (t - breakStart) / 1000;
        breakStart = null;
        break;
      default:
        break;
    }
  }

  const last = todayRecords.at(-1);
  if (!last) return { work: 0, break: 0 };

  const lastT = new Date(last.timestamp).getTime();
  if (last.type === "entry" || last.type === "break_end") {
    work += (now - lastT) / 1000;
  } else if (last.type === "break_start") {
    breakTime += (now - lastT) / 1000;
  }

  return { work: Math.floor(work), break: Math.floor(breakTime) };
};

export default function Clock({ mode = "office", onRecord }) {
  const [status, setStatus] = useState("idle");
  const [workSeconds, setWorkSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const { data } = await api.get("/records/status");
        const lastType = data.lastRecord?.type ?? null;
        setStatus(lastTypeToUiStatus(lastType));
        const { work, break: brk } = computeElapsedSeconds(data.todayRecords);
        setWorkSeconds(work);
        setBreakSeconds(brk);
      } catch {
        setStatus("idle");
      } finally {
        setInitializing(false);
      }
    };
    loadStatus();
  }, []);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (status === "working") {
      intervalRef.current = setInterval(() => setWorkSeconds((s) => s + 1), 1000);
    } else if (status === "break") {
      intervalRef.current = setInterval(() => setBreakSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  const handleRecord = async (type, nextStatus) => {
    setLoading(true);
    setError(null);
    try {
      const record = await postRecord(type, mode);
      setStatus(nextStatus);
      if (nextStatus === "idle") {
        setWorkSeconds(0);
        setBreakSeconds(0);
      }
      onRecord?.(record);    /* notifica a App.jsx con la respuesta del backend */
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEntry = () => handleRecord("entry", "working");
  const handleExit = () => handleRecord("exit", "idle");
  const handleBreakStart = () => handleRecord("break_start", "break");
  const handleBreakEnd = () => handleRecord("break_end", "working");

  const progress = Math.min(workSeconds / WORK_DAY_SECONDS, 1);
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  const STATE = {
    idle: { label: "Sin fichar", dotClass: "clock__dot--idle", ringClass: "clock__ring--idle" },
    working: { label: "Trabajando", dotClass: "clock__dot--working", ringClass: "clock__ring--working" },
    break: { label: "En descanso", dotClass: "clock__dot--break", ringClass: "clock__ring--break" },
  };
  const current = STATE[status];

  return (
    <section className="clock" aria-label="Herramienta de fichaje">

      <div className="clock__header">
        <span className={`clock__dot ${current.dotClass}`} aria-hidden="true" />
        <span className="clock__status">{current.label}</span>
      </div>

      <div className="clock__ring-wrap">
        <svg className="clock__svg" viewBox="0 0 160 160" aria-hidden="true">
          <circle className="clock__track" cx="80" cy="80" r={RING_RADIUS} />
          <circle
            className={`clock__progress ${current.ringClass}`}
            cx="80" cy="80"
            r={RING_RADIUS}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div
          className="clock__time-block"
          aria-live="polite"
          aria-label={`Tiempo trabajado: ${formatTime(workSeconds)}`}
        >
          <img src={ICONS.clock} alt="" aria-hidden="true" className="clock__time-icon" />
          <span className="clock__time">{formatTime(workSeconds)}</span>
        </div>
      </div>

      {status === "break" && (
        <div className="clock__break-info" aria-live="polite">
          <img src={ICONS.coffee} alt="" aria-hidden="true" className="clock__break-icon" />
          <span className="clock__break-time">Descanso: {formatTime(breakSeconds)}</span>
        </div>
      )}

      {error && (
        <p className="clock__error" role="alert">{error}</p>
      )}

      <div className="clock__actions">

        {status === "idle" && (
          <button
            className="clock__btn clock__btn--entry"
            onClick={handleEntry}
            disabled={loading || initializing}
            aria-label="Registrar entrada"
          >
            <img src={ICONS.enter} alt="" aria-hidden="true" className="clock__btn-icon" />
            {initializing ? "Cargando..." : loading ? "Registrando..." : "Fichar entrada"}
          </button>
        )}

        {(status === "working" || status === "break") && (
          <button
            className="clock__btn clock__btn--exit"
            onClick={handleExit}
            disabled={loading || initializing}
            aria-label="Registrar salida"
          >
            <img src={ICONS.exit} alt="" aria-hidden="true" className="clock__btn-icon" />
            {initializing ? "Cargando..." : loading ? "Registrando..." : "Fichar salida"}
          </button>
        )}

        {status === "working" && (
          <button
            className="clock__btn clock__btn--break-start"
            onClick={handleBreakStart}
            disabled={loading || initializing}
            aria-label="Iniciar descanso"
          >
            <img src={ICONS.pause} alt="" aria-hidden="true" className="clock__btn-icon" />
            {initializing ? "Cargando..." : loading ? "Registrando..." : "Iniciar descanso"}
          </button>
        )}

        {status === "break" && (
          <button
            className="clock__btn clock__btn--break-end"
            onClick={handleBreakEnd}
            disabled={loading || initializing}
            aria-label="Finalizar descanso"
          >
            <img src={ICONS.play} alt="" aria-hidden="true" className="clock__btn-icon" />
            {initializing ? "Cargando..." : loading ? "Registrando..." : "Finalizar descanso"}
          </button>
        )}

      </div>

      {status !== "idle" && (
        <p className="clock__progress-label" aria-hidden="true">
          {Math.round(progress * 100)}% de la jornada completada
        </p>
      )}

    </section>
  );
}