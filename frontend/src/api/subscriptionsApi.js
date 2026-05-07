import api from './usersApi'

export const subscriptionsApi = {
  // Obtener suscripción actual
  getMySubscription: () => api.get('/subscriptions/my-subscription'),

  // Actualizar plan
  upgrade: (plan) => api.patch('/subscriptions/upgrade', { plan }),

  // Cancelar suscripción
  cancel: () => api.patch('/subscriptions/cancel'),

  // Reactivar suscripción
  reactivate: () => api.patch('/subscriptions/reactivate')
}