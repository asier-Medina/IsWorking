import api from './api'

export const adminApi = {
  // Empleados
  getEmployees: () => api.get('/users'),
  createEmployee: (data) => api.post('/users', data),
  updateEmployee: (id, data) => api.patch(`/users/${id}`, data),
  setEmployeeStatus: (id, active) => api.patch(`/users/${id}/status`, { active }),

  // Turnos
  getShiftTemplates: () => api.get('/shift-templates'),
  createShiftTemplate: (data) => api.post('/shift-templates', data),

  // Horarios
  getSchedules: () => api.get('/schedules'),
  createSchedule: (data) => api.post('/schedules', data),
  updateScheduleStatus: (id, status) => api.patch(`/schedules/${id}/status`, { status }),

  // Registros
  getRecords: () => api.get('/records')
}