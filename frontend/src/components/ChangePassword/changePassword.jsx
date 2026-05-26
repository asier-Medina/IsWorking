import { useState } from "react";
import api from "../../lib/api";
import "./changePassword.css";

export default function ChangePassword({ isOpen, onClose }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (newPassword !== confirmPassword) {
            setError("La nueva contraseña y la confirmación no coinciden.");
            return;
        }

        if (newPassword.length < 6) {
            setError("La nueva contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/change-password", {
                currentPassword,
                newPassword,
            });

            setSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 2000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Error al cambiar la contraseña. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-box">
                <div className="modal-header">
                    <h2>Actualizar Contraseña</h2>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="modal-alert modal-alert--danger">{error}</div>}
                    {success && <div className="modal-alert modal-alert--success">¡Contraseña actualizada con éxito!</div>}

                    <div className="modal-field">
                        <label htmlFor="currentPassword">Contraseña Actual</label>
                        <input
                            id="currentPassword"
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={loading || success}
                        />
                    </div>

                    <div className="modal-field">
                        <label htmlFor="newPassword">Nueva Contraseña</label>
                        <input
                            id="newPassword"
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            disabled={loading || success}
                        />
                    </div>

                    <div className="modal-field">
                        <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite la nueva contraseña"
                            disabled={loading || success}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-modal-cancel" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-modal-submit" disabled={loading || success}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}