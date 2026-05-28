import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Admin.css'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`admin-layout ${expanded ? 'admin-layout--expanded' : ''}`}>
      <aside className={`admin-sidebar ${expanded ? 'admin-sidebar--expanded' : ''}`}>

        <div className="admin-sidebar__top">
          {expanded && <h2 className="admin-sidebar__title">IsWorking</h2>}
          <button
            className="admin-sidebar__toggle"
            onClick={() => setExpanded(prev => !prev)}
            aria-label={expanded ? 'Cerrar menú' : 'Abrir menú'}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {expanded && (
          <>
            <p className="admin-sidebar__subtitle">{user?.name || 'Admin'}</p>

            <nav className="admin-nav">
              <NavLink to="/admin/empleados" onClick={() => setExpanded(false)}>Empleados</NavLink>
              <NavLink to="/admin/turnos" onClick={() => setExpanded(false)}>Turnos</NavLink>
              <NavLink to="/admin/horarios" onClick={() => setExpanded(false)}>Horarios</NavLink>
              <NavLink to="/admin/registros" onClick={() => setExpanded(false)}>Registros</NavLink>
            </nav>

            <button className="admin-logout" onClick={logout}>
              Cerrar sesión
            </button>
          </>
        )}
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}