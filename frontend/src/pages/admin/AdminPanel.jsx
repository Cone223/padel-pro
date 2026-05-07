import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'

const StatCard = ({ title, value, icon, color, to }) => (
  <Link to={to || '#'} className={`card p-6 flex items-start gap-4 hover:border-${color}-500/30 hover:-translate-y-0.5 transition-all duration-200`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-${color}-500/10 border border-${color}-500/20`}>
      {icon}
    </div>
    <div>
      <p className="text-dark-300 text-sm mb-1">{title}</p>
      <p className="text-white font-bold text-3xl">{value?.toLocaleString()}</p>
    </div>
  </Link>
)

export default function AdminPanel() {
  const { user } = useAuth()
  const toast = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats().then(({ data }) => {
      setStats(data.data)
      setLoading(false)
    }).catch(() => {
      toast.error('Error al cargar estadísticas.')
      setLoading(false)
    })
  }, [])

  const navItems = [
    { to: '/admin/users', icon: '👥', label: 'Usuarios', desc: 'Gestionar cuentas y roles' },
    { to: '/admin/courts', icon: '🎾', label: 'Canchas', desc: 'Crear y administrar canchas' },
    { to: '/admin/bookings', icon: '📅', label: 'Reservas', desc: 'Ver y gestionar turnos' },
    { to: '/admin/tournaments', icon: '🏆', label: 'Torneos', desc: 'Organizar competencias' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-sm">⚡</div>
            <span className="text-brand-400 text-sm font-medium uppercase tracking-wider">Panel Admin</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-300 mt-1">Bienvenido, <span className="text-brand-400 font-medium">{user?.name}</span>. Control total del sistema.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/courts" className="btn-secondary">+ Cancha</Link>
          <Link to="/admin/tournaments" className="btn-primary">+ Torneo</Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard title="Usuarios" value={stats?.totalUsers} icon="👥" color="blue" to="/admin/users" />
            <StatCard title="Canchas" value={stats?.totalCourts} icon="🎾" color="green" to="/admin/courts" />
            <StatCard title="Reservas" value={stats?.totalBookings} icon="📅" color="purple" to="/admin/bookings" />
            <StatCard title="Ingresos ($)" value={stats?.totalRevenue} icon="💰" color="yellow" />
          </>
        )}
      </div>

      {/* Revenue chart */}
      {stats?.monthlyRevenue?.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="text-white font-semibold mb-4">Ingresos últimos 6 meses</h2>
          <div className="flex items-end gap-2 h-32">
            {stats.monthlyRevenue.map((m, i) => {
              const max = Math.max(...stats.monthlyRevenue.map(x => x.revenue))
              const height = max > 0 ? (m.revenue / max) * 100 : 0
              const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-dark-400 text-xs">${(m.revenue / 1000).toFixed(0)}k</div>
                  <div className="w-full bg-dark-700 rounded-t-sm relative" style={{ height: '80px' }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-brand-500/70 hover:bg-brand-500 rounded-t-sm transition-all" style={{ height: `${height}%` }} />
                  </div>
                  <div className="text-dark-400 text-xs">{months[m._id.month - 1]}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick nav */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {navItems.map(({ to, icon, label, desc }) => (
          <Link key={to} to={to} className="card-hover group p-5 flex flex-col gap-3 hover:-translate-y-1 transition-all duration-200">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-xl">
              {icon}
            </div>
            <div>
              <h3 className="text-white font-semibold group-hover:text-brand-400 transition-colors">{label}</h3>
              <p className="text-dark-400 text-sm mt-0.5">{desc}</p>
            </div>
            <span className="text-brand-400 text-sm mt-auto group-hover:translate-x-1 transition-transform inline-block">Gestionar →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
