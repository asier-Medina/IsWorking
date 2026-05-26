import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Clock from "../../components/Clock/Clock.jsx";

export default function Dashboard() {
    const storedUser = JSON.parse(localStorage.getItem("iw_user") || "{}");
    const navigate = useNavigate();

    const [workMode, setWorkMode] = useState("office");

    const userForHeader = {
        name: storedUser.name || "Empleado",
        role: storedUser.role === "admin" ? "Administrador" : "Empleado"
    };

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Error al avisar al backend del logout:", error);
        } finally {
            localStorage.removeItem("iw_user");
            navigate("/login");
        }
    };

    const handleRecordRegistered = (newRecord) => {
        console.log("¡Fichaje registrado con éxito en el Dashboard!", newRecord);
    };

    return (
        <div className="dashboard-layout">

            <Header user={userForHeader} onLogout={handleLogout} />


            <main className="dashboard-main">
                <div className="dashboard-container">
                    <header className="dashboard-welcome">
                        <h1>Bienvenido, {userForHeader.name}</h1>
                        <p>Gestiona tu jornada laboral desde tu panel de control.</p>
                    </header>

                    <div className="dashboard-grid">

                        {storedUser.remote_allowed && (
                            <div className="dashboard-card mode-selector">
                                <h3>Modalidad de fichaje activa</h3>
                                <div className="mode-buttons" style={{ marginTop: '1rem' }}>
                                    <button
                                        className={`btn-mode ${workMode === "office" ? "active" : ""}`}
                                        onClick={() => setWorkMode("office")}
                                    >
                                        Presencial (Oficina)
                                    </button>
                                    <button
                                        className={`btn-mode ${workMode === "remote" ? "active" : ""}`}
                                        onClick={() => setWorkMode("remote")}
                                    >
                                        Teletrabajo (Remoto)
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="dashboard-card clock-section">
                            <Clock mode={workMode} onRecord={handleRecordRegistered} />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}