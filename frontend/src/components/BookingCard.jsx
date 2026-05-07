import React from 'react'
import { Link } from 'react-router-dom'

const BookingCard = ({ booking, showUser = false, onStatusUpdate }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="card p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            {booking.court?.name}
          </h3>
          {showUser && booking.user && (
            <p className="text-sm text-gray-600 mt-1">
              Por: {booking.user.name}
            </p>
          )}
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
          {booking.status === 'pending' && 'Pendiente'}
          {booking.status === 'confirmed' && 'Confirmada'}
          {booking.status === 'completed' && 'Completada'}
          {booking.status === 'cancelled' && 'Cancelada'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(booking.date)}
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {booking.startTime} - {booking.endTime}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-primary">
          ${booking.totalPrice}
        </span>
        <div className="flex space-x-2">
          <Link
            to={`/cancha/${booking.court?._id}`}
            className="text-sm text-primary hover:text-green-700 font-medium"
          >
            Ver Cancha
          </Link>
          {onStatusUpdate && (booking.status === 'pending' || booking.status === 'confirmed') && (
            <button
              onClick={() => onStatusUpdate(booking._id, 'cancelled')}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingCard