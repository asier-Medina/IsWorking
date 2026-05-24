// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restore = async () => {
      try {
        await api.post('/auth/refresh')
        const stored = localStorage.getItem('iw_user')
        if (stored) setUser(JSON.parse(stored))
      } catch {
        setUser(null)
        localStorage.removeItem('iw_user')
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setUser(data.user)
    localStorage.setItem('iw_user', JSON.stringify(data.user))
    return data.user
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    setUser(null)
    localStorage.removeItem('iw_user')
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)