// frontend/src/components/CourtCard.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import BookingCalendar from './BookingCalendar'

const CourtCard = ({ court }) => {
  const [showCalendar, setShowCalendar] = useState(false)

  const getCourtTypeColor = (type) => {
    const colors = {
      'cristal': 'bg-blue-100 text-blue-800',
      'hormigon': 'bg-gray-100 text-gray-800',
      'cesped artificial': 'bg-green-100 text-green-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getFacilityIcon = (facility) => {
    const icons = {
      'iluminacion': '💡',
      'vestuarios': '🚿',
      'duchas': '🚿',
      'bar': '🍹',
      'parking': '🅿️',
      'wifi': '📶'
    }
    return icons[facility] || '✅'
  }

  return (
    <>
      <div className="card hover:shadow-lg transition-shadow duration-300">
        {/* Imagen de la Cancha */}
        <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500 rounded-t-lg overflow-hidden">
          {court.images && court.images[0] ? (
            <img 
              src={court.images[0]} 
              alt={court.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-6xl">
              🎾
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCourtTypeColor(court.courtType)}`}>
              {court.courtType}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {court.name}
            </h3>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm text-gray-600">{court.rating}</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {court.description}
          </p>

          {court.address && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <span className="mr-1">📍</span>
              <span>{court.address.street}, {court.address.city}</span>
            </div>
          )}

          {/* Instalaciones */}
          {court.facilities && court.facilities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {court.facilities.slice(0, 3).map((facility, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {getFacilityIcon(facility)} {facility}
                </span>
              ))}
              {court.facilities.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +{court.facilities.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Precio y Botones */}
          <div className="flex justify-between items-center mt-4">
            <div>
              <span className="text-2xl font-bold text-green-600">${court.pricePerHour}</span>
              <span className="text-gray-500 text-sm">/hora</span>
            </div>
            <div className="flex space-x-2">
              <Link
                to={`/cancha/${court._id}`}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Ver Detalles
              </Link>
              <button
                onClick={() => setShowCalendar(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Reservar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal del Calendario */}
      {showCalendar && (
        <BookingCalendar 
          court={court}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </>
  )
}

export default CourtCard