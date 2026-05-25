import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Admin.css'

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>IsWorking</h2>
          <p>Panel RRHH</p>
          <p>{user?.name || 'Admin'}</p>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin/empleados">Empleados</NavLink>
          <NavLink to="/admin/turnos">Turnos</NavLink>
          <NavLink to="/admin/horarios">Horarios</NavLink>
          <NavLink to="/admin/registros">Registros</NavLink>
        </nav>

        <button className="admin-logout" onClick={logout}>
          Cerrar sesión
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
