import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './superadmin.css'

export default function SuperAdminLayout() {
  const { user, logout } = useAuth()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`sa-layout ${expanded ? 'sa-layout--expanded' : ''}`}>
      <aside className={`sa-sidebar ${expanded ? 'sa-sidebar--expanded' : ''}`}>

        <div className="sa-sidebar__top">
          {expanded && <h2 className="sa-sidebar__title">IsWorking</h2>}
          <button
            className="sa-sidebar__toggle"
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
            <p className="sa-sidebar__subtitle">{user?.name || 'Superadmin'}</p>

            <nav className="sa-sidebar__nav">
              <NavLink to="/superadmin/empresas" onClick={() => setExpanded(false)}>Empresas</NavLink>
              <NavLink to="/superadmin/usuarios" onClick={() => setExpanded(false)}>Usuarios</NavLink>
            </nav>

            <button className="sa-logout" onClick={logout}>
              Cerrar sesión
            </button>
          </>
        )}
      </aside>

      <main className="sa-content">
        <Outlet />
      </main>
    </div>
  )
}