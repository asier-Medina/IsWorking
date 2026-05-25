import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      // Si ya estamos en login, no redirigir
      if (window.location.pathname === '/login') {
        return Promise.reject(error)
      }

      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        return api(original)
      } catch {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api