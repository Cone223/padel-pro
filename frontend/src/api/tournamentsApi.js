import api from './usersApi'

export const tournamentsApi = {
  // Obtener todos los torneos
  getAll: (filters = {}) => {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })
    return api.get(`/tournaments?${params}`)
  },

  // Obtener torneo por ID
  getById: (id) => api.get(`/tournaments/${id}`),

  // Crear torneo (admin/owner)
  create: (tournamentData) => api.post('/tournaments', tournamentData),

  // Actualizar torneo (admin/owner)
  update: (id, tournamentData) => api.patch(`/tournaments/${id}`, tournamentData),

  // Inscribirse en torneo
  register: (id, partnerData = {}) => api.post(`/tournaments/${id}/register`, partnerData),

  // Cancelar inscripción
  unregister: (id) => api.post(`/tournaments/${id}/unregister`),

  // Obtener mis torneos
  getMyTournaments: (type = 'registered') => api.get(`/tournaments/my-tournaments?type=${type}`)
}