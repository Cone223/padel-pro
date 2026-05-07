import api from './usersApi'

export const dashboardApi = {
  // Obtener estadísticas
  getStats: (period = 'month') => 
    api.get(`/dashboard/stats?period=${period}`),

  // Obtener gráfico de ingresos
  getRevenueChart: (months = 6) => 
    api.get(`/dashboard/revenue-chart?months=${months}`),

  // Obtener actividades recientes
  getActivities: (limit = 10) => 
    api.get(`/dashboard/activities?limit=${limit}`)
}