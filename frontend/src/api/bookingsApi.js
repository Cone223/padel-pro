// frontend/src/api/bookingsApi.js
import api from './usersApi'

export const bookingsApi = {
  // Obtener disponibilidad de una cancha
  getAvailability: (courtId, date) => 
    api.get(`/bookings/availability/${courtId}?date=${date}`),
  
  // Crear reserva
  create: (bookingData) => api.post('/bookings', bookingData),
  
  // Obtener reservas del usuario
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  
  // Obtener reservas de una cancha (para dueños)
  getCourtBookings: (params) => api.get('/bookings/court-bookings', { params }),
  
  // Cancelar reserva
  cancel: (bookingId) => api.patch(`/bookings/${bookingId}/cancel`),
  
  // Actualizar estado de reserva
  updateStatus: (bookingId, statusData) => 
    api.patch(`/bookings/${bookingId}/status`, statusData)
}