import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  r => r,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  changePassword: (data) => api.patch('/auth/change-password', data),
}

export const courtsApi = {
  getAll: (params) => api.get('/courts', { params }),
  getById: (id) => api.get(`/courts/${id}`),
  getMy: () => api.get('/courts/my-courts'),
  create: (data) => api.post('/courts', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.patch(`/courts/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/courts/${id}`),
}

export const bookingsApi = {
  create: (data) => api.post('/bookings', data),
  getMy: (params) => api.get('/bookings/my-bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  getAvailability: (courtId, date) => api.get('/bookings/availability', { params: { courtId, date } }),
  getCourtBookings: (params) => api.get('/bookings/court-bookings', { params }),
}

export const tournamentsApi = {
  getAll: (params) => api.get('/tournaments', { params }),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (data) => api.post('/tournaments', data),
  update: (id, data) => api.patch(`/tournaments/${id}`, data),
  delete: (id) => api.delete(`/tournaments/${id}`),
  join: (id, data) => api.post(`/tournaments/${id}/join`, data),
  leave: (id) => api.delete(`/tournaments/${id}/leave`),
}

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  changeRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  updateBookingStatus: (id, status) => api.patch(`/admin/bookings/${id}/status`, { status }),
  getAllCourts: () => api.get('/admin/courts'),
  toggleCourt: (id) => api.patch(`/admin/courts/${id}/toggle`),
  deleteCourt: (id) => api.delete(`/admin/courts/${id}`),
}

export default api
