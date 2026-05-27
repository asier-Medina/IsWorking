import { NavLink, Outlet, useRef, useEffect } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './superadmin.css'

export default function SuperAdminLayout() {
  const { user, logout } = useAuth()
  const sidebarRef = useRef(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
        // Scroll hacia abajo → colapsar
        sidebarRef.current?.classList.add('sa-sidebar--collapsed')
      } else {
        // Scroll hacia arriba → expandir
        sidebarRef.current?.classList.remove('sa-sidebar--collapsed')
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="sa-layout">
      <aside className="sa-sidebar" ref={sidebarRef}>
        <div className="sa-sidebar__brand">
          <h2>IsWorking</h2>
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