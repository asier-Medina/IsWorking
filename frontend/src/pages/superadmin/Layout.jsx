import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './superadmin.css'

export default function SuperAdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="sa-layout">
      <aside className="sa-sidebar">
        <div className="sa-sidebar__brand">
          <h2>IsWorking</h2>
          <p>Panel Superadmin</p>
          <p>{user?.name || 'Superadmin'}</p>
        </div>

        <nav className="sa-sidebar__nav">
          <NavLink to="/superadmin/empresas">Empresas</NavLink>
          <NavLink to="/superadmin/usuarios">Usuarios</NavLink>
        </nav>

        <button className="sa-logout" onClick={logout}>
          Cerrar sesión
        </button>
      </aside>

      <main className="sa-content">
        <Outlet />
      </main>
    </div>
  )
}