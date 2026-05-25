import { useEffect, useState } from "react";
import api from "../../lib/api.js";
import "./Historial.css";

export default function Historial() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // 🎯 Unificamos el nombre a selectedMonth
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    useEffect(() => {
        const getRecords = async () => {
            try {
                setLoading(true);
                const response = await api.get("/records");
                setRecords(response.data);
            } catch (error) {
                setError(error.response?.data?.error || "Error al cargar el historial");
            } finally {
                setLoading(false);
            }
        };
        getRecords();
    }, []);

    const typeMap = {
        entry: { text: "Entrada", class: "badge--entry" },
        break_start: { text: "Inicio Pausa", class: "badge--break-start" },
        break_end: { text: "Fin Pausa", class: "badge--break-end" },
        exit: { text: "Salida", class: "badge--exit" },
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

    const formatHour = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    };

    // 🎯 Filtrado corregido usando de forma segura 'new Date' y 'selectedMonth'
    const registerFilter = records.filter((r) => {
        const dateRegister = new Date(r.timestamp);
        return (
            dateRegister.getMonth() === selectedMonth &&
            dateRegister.getFullYear() === new Date().getFullYear()
        );
    });

    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    if (loading) return <div className="record__loading">Cargando historial...</div>;
    if (error) return <div className="record__error" role="alert">{error}</div>;

    return (
        <section className="record" aria-label="Historial de fichajes">
            <div className="record__header">
                <h2>Historial de Fichajes</h2>

                <div className="record__filter">
                    <label htmlFor="select-month">Filtrar por mes:</label>
                    <select
                        id="select-month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                        ))}
                    </select>
                </div>
            </div>

            {registerFilter.length === 0 ? (
                <p className="record__empty">
                    No se han encontrado registros de fichajes en el mes de {months[selectedMonth]}.
                </p>
            ) : (
                <div className="record__table__wrapper">
                    <table className="record__tabla">
                        <thead>
                            {/* 🎯 Corrección de la estructura de cabecera estándar HTML */}
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Acción</th>
                                <th>Modalidad</th>
                                <th>Coordenadas (GPS)</th>
                            </tr>
                        </thead>
                        {/* 🎯 Cambiado thbody por tbody */}
                        <tbody>
                            {registerFilter.map((record) => {
                                const configType = typeMap[record.type] || { text: record.type, class: "" };
                                return (
                                    <tr key={record.id}>
                                        <td><strong>{formatDate(record.timestamp)}</strong></td>
                                        <td className="record__time">{formatHour(record.timestamp)}</td>
                                        <td>
                                            {/* 🎯 Corregidos los strings de las clases dinámicas */}
                                            <span className={`badge ${configType.class}`}>{configType.text}</span>
                                        </td>
                                        <td>
                                            <span className={`mode-tag mode-tag--${record.mode}`}>
                                                {record.mode === "remote" ? "Teletrabajo" : "Oficina"}
                                            </span>
                                        </td>
                                        <td className="record__gps">
                                            {record.latitude && record.longitude ? (
                                                <span title={`Precisión: ${record.accuracy}m`}>
                                                    {Number(record.latitude).toFixed(4)}, {Number(record.longitude).toFixed(4)}
                                                </span>
                                            ) : (
                                                <span className="record__no-gps">Sin GPS</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}