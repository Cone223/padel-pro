import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { bookingsApi, courtsApi } from '../services/api'

const StatusBadge = ({ status }) => {
  const map = {
    pending: ['badge-yellow', 'Pendiente'],
    confirmed: ['badge-green', 'Confirmado'],
    cancelled: ['badge-red', 'Cancelado'],
    completed: ['badge-gray', 'Completado'],
  }
  const [cls, label] = map[status] || ['badge-gray', status]
  return <span className={cls}>{label}</span>
}

const BookingRow = ({ booking, onCancel }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-dark-700 rounded-xl border border-dark-600">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-xl">🎾</div>
      <div>
        <p className="text-white font-medium">{booking.court?.name || 'Cancha'}</p>
        <p className="text-dark-400 text-sm">{new Date(booking.date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })} · {booking.startTime} - {booking.endTime}</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-white font-semibold">${booking.totalPrice}</span>
      <StatusBadge status={booking.status} />
      {booking.status === 'pending' && (
        <button onClick={() => onCancel(booking._id)} className="btn-danger py-1 px-3 text-xs">Cancelar</button>
      )}
    </div>
  </div>
)

export default function Dashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState({ total: 0, upcoming: 0, cancelled: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('bookings')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data } = await bookingsApi.getMy()
      const bks = data.data.bookings
      setBookings(bks)
      setStats({
        total: bks.length,
        upcoming: bks.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
        cancelled: bks.filter(b => b.status === 'cancelled').length,
      })
    } catch (error) {
      toast.error('Error al cargar datos.')
    } finally { setLoading(false) }
  }

  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar esta reserva?')) return
    try {
      await bookingsApi.cancel(id)
      toast.success('Reserva cancelada.')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cancelar.')
    }
  }

  const upcomingBookings = bookings.filter(b => ['pending', 'confirmed'].includes(b.status))
  const pastBookings = bookings.filter(b => ['cancelled', 'completed'].includes(b.status))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hola, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-dark-300 mt-1">Aquí está tu resumen de actividad</p>
        </div>
        <Link to="/canchas" className="btn-primary">+ Nueva reserva</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total reservas', value: stats.total, icon: '📅' },
          { label: 'Próximas', value: stats.upcoming, icon: '⏰' },
          { label: 'Canceladas', value: stats.cancelled, icon: '✕' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card p-5 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-dark-400 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Role badge */}
      {(user?.role === 'admin' || user?.role === 'owner') && (
        <div className="card p-4 mb-6 flex items-center gap-4 border-brand-500/20 bg-brand-500/5">
          <span className="text-2xl">⚡</span>
          <div className="flex-1">
            <p className="text-white font-semibold">Modo {user.role === 'admin' ? 'Administrador' : 'Propietario'}</p>
            <p className="text-dark-300 text-sm">Tenés acceso a funciones avanzadas del sistema.</p>
          </div>
          {user?.role === 'admin' && (
            <Link to="/admin" className="btn-primary">Panel Admin</Link>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-800 rounded-xl mb-6 w-fit">
        {[['bookings', '🎾 Mis Reservas'], ['profile', '👤 Mi Perfil']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-brand-500 text-white shadow-green' : 'text-dark-300 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
          ) : (
            <>
              {upcomingBookings.length > 0 && (
                <div>
                  <h2 className="text-white font-semibold mb-3">Próximas reservas</h2>
                  <div className="space-y-3">
                    {upcomingBookings.map(b => <BookingRow key={b._id} booking={b} onCancel={handleCancel} />)}
                  </div>
                </div>
              )}
              {pastBookings.length > 0 && (
                <div>
                  <h2 className="text-white font-semibold mb-3 text-dark-300">Historial</h2>
                  <div className="space-y-3 opacity-70">
                    {pastBookings.map(b => <BookingRow key={b._id} booking={b} onCancel={handleCancel} />)}
                  </div>
                </div>
              )}
              {bookings.length === 0 && (
                <div className="card p-12 text-center">
                  <div className="text-5xl mb-4">🎾</div>
                  <h3 className="text-white font-semibold mb-2">No tenés reservas aún</h3>
                  <p className="text-dark-300 mb-6">Buscá una cancha y hacé tu primera reserva.</p>
                  <Link to="/canchas" className="btn-primary">Ver canchas</Link>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="card p-6 max-w-lg">
          <h2 className="text-white font-semibold mb-5">Información personal</h2>
          <div className="space-y-3">
            {[['Nombre', user?.name], ['Email', user?.email], ['Teléfono', user?.phone || 'No especificado'], ['Rol', user?.role]].map(([k, v]) => (
              <div key={k} className="flex items-center gap-4 py-3 border-b border-dark-600 last:border-0">
                <span className="text-dark-400 text-sm w-24">{k}</span>
                <span className="text-white text-sm">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
