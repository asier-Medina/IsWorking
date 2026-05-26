import { useState } from "react";
import Clock from "../../components/Clock/Clock.jsx"; // 🎯 Asegúrate de cuadrar tu ruta

export default function Dashboard() {
    const storedUser = JSON.parse(localStorage.getItem("iw_user") || "{}");

    const [workMode, setWorkMode] = useState("office");

    const handleRecordRegistered = (newRecord) => {
        console.log(" ¡Fichaje registrado con éxito en el Dashboard!", newRecord);
    };

    return (
        <div className="dashboard-page">
            <header className="dashboard-page__header">
                <h1>Bienvenido, {storedUser.name || "Empleado"}</h1>
                <p>Gestiona tu jornada laboral desde tu panel de control.</p>
            </header>

            <main className="dashboard-page__content">
                {storedUser.remote_allowed && (
                    <div className="dashboard-page__mode-selector">
                        <label htmlFor="mode-select">Modalidad de fichaje activa:</label>
                        <select
                            id="mode-select"
                            value={workMode}
                            onChange={(e) => setWorkMode(e.target.value)}
                        >
                            <option value="office">🏢 Presencial (Oficina)</option>
                            <option value="remote">🏠 Teletrabajo (Remoto)</option>
                        </select>
                    </div>
                )}

                <div className="dashboard-page__clock-container">
                    <Clock mode={workMode} onRecord={handleRecordRegistered} />
                </div>
            </main>
        </div>
    );
}