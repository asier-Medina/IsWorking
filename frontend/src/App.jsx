import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import './index.css'

import Login      from './pages/Login/Login'
import Dashboard  from './pages/Dashboard/Dashboard'
import Historial  from './pages/Historial/Historial'

import AdminLayout   from './pages/admin/Layout'
import Empleados     from './pages/admin/Empleados'
import Turnos        from './pages/admin/Turnos'
import Horarios      from './pages/admin/Horarios'
import Registros     from './pages/admin/Registros'

import SuperAdminLayout from './pages/superadmin/Layout'
import Empresas         from './pages/superadmin/Empresas'
import SuperUsuarios    from './pages/superadmin/Usuarios'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <p style={{ color: 'var(--iw-text-muted)' }}>Cargando...</p>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'superadmin') return <Navigate to="/superadmin/empresas" replace />
  if (user.role === 'admin')      return <Navigate to="/admin/empleados" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Pública */}
          <Route path="/login" element={<Login />} />

          {/* Raíz — redirige según rol */}
          <Route path="/" element={<RootRedirect />} />

          {/* Empleado */}
          <Route path="/dashboard" element={
            <PrivateRoute roles={['employee']}>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/historial" element={
            <PrivateRoute roles={['employee']}>
              <Historial />
            </PrivateRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="empleados" replace />} />
            <Route path="empleados" element={<Empleados />} />
            <Route path="turnos"    element={<Turnos />} />
            <Route path="horarios"  element={<Horarios />} />
            <Route path="registros" element={<Registros />} />
          </Route>

          {/* Superadmin */}
          <Route path="/superadmin" element={
            <PrivateRoute roles={['superadmin']}>
              <SuperAdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="empresas" replace />} />
            <Route path="empresas" element={<Empresas />} />
            <Route path="usuarios" element={<SuperUsuarios />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}