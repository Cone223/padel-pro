import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const QuickActions = () => {
  const { user } = useAuth()

  const ownerActions = [
    { icon: '➕', label: 'Agregar Cancha', link: '/dashboard?tab=courts', color: 'green' },
    { icon: '🏆', label: 'Crear Torneo', link: '/dashboard?tab=tournaments', color: 'yellow' },
    { icon: '📊', label: 'Ver Reportes', link: '/dashboard?tab=reports', color: 'blue' },
    { icon: '👥', label: 'Gestionar Staff', link: '/dashboard?tab=staff', color: 'purple' }
  ]

  const userActions = [
    { icon: '🔍', label: 'Buscar Canchas', link: '/canchas', color: 'green' },
    { icon: '🏆', label: 'Ver Torneos', link: '/torneos', color: 'yellow' },
    { icon: '📅', label: 'Mis Reservas', link: '/dashboard?tab=bookings', color: 'blue' },
    { icon: '⭐', label: 'Favoritos', link: '/dashboard?tab=favorites', color: 'purple' }
  ]

  const actions = user?.role === 'owner' ? ownerActions : userActions

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-center"
          >
            <span className="text-2xl mb-2">{action.icon}</span>
            <span className="text-sm font-medium text-gray-900">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default QuickActions