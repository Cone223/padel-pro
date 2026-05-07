import api from './usersApi'

export const courtsApi = {
  // Obtener todas las canchas con filtros
  getAll: (filters = {}) => {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    return api.get(`/courts?${params}`)
  },

  // Obtener canchas cercanas
  getNearby: (lat, lng, maxDistance = 10) => 
    api.get(`/courts/nearby?lat=${lat}&lng=${lng}&maxDistance=${maxDistance}`),

  // Obtener cancha por ID
  getById: (id) => api.get(`/courts/${id}`),

  // Obtener disponibilidad
  getAvailability: (id, date) => 
    api.get(`/courts/${id}/availability${date ? `?date=${date}` : ''}`),

  // Crear cancha
  create: (courtData) => api.post('/courts', courtData),

  // Actualizar cancha
  update: (id, courtData) => api.patch(`/courts/${id}`, courtData),

  // Eliminar cancha
  delete: (id) => api.delete(`/courts/${id}`),

  // Agregar review
  addReview: (id, reviewData) => api.post(`/courts/${id}/reviews`, reviewData),

  // Obtener mis canchas (para owners)
  getMyCourts: () => api.get('/courts/my-courts')
}