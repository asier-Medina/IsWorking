import api from './api'

export const superadminApi = {
  // Empresas
  getCompanies:       ()         => api.get('/companies'),
  createCompany:      (data)     => api.post('/companies', data),
  activateCompany:    (id)       => api.patch(`/companies/${id}/activate`),
  deactivateCompany:  (id)       => api.patch(`/companies/${id}/deactivate`),

  // Usuarios (todos, de todas las empresas)
  getAllUsers:         ()         => api.get('/users'),
  setUserStatus:      (id, active) => api.patch(`/users/${id}/status`, { active }),
}