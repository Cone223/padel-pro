import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const TournamentCard = ({ tournament, onRegister, onUnregister }) => {
  const { user, isAuthenticated } = useAuth()

  const getCategoryColor = (category) => {
    const colors = {
      principiante: 'bg-green-100 text-green-800',
      intermedio: 'bg-yellow-100 text-yellow-800',
      avanzado: 'bg-red-100 text-red-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryText = (category) => {
    const texts = {
      principiante: 'Principiante',
      intermedio: 'Intermedio', 
      avanzado: 'Avanzado'
    }
    return texts[category] || category
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isRegistered = user && tournament.participants?.some(
    participant => participant.user._id === user.id || participant.user === user.id
  )

  const isFull = tournament.currentParticipants >= tournament.maxParticipants
  const registrationClosed = tournament.registrationDeadline && 
    new Date() > new Date(tournament.registrationDeadline)

  const canRegister = isAuthenticated && !isRegistered && !isFull && !registrationClosed

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      {/* Header con imagen */}
      <div className="h-48 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center relative">
        {tournament.image ? (
          <img 
            src={tournament.image} 
            alt={tournament.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-2xl font-bold text-center px-4">
            {tournament.name}
          </span>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(tournament.category)}`}>
            {getCategoryText(tournament.category)}
          </span>
          {!tournament.isActive && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-500 text-white">
              Inactivo
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className="text-2xl font-bold text-white bg-black bg-opacity-50 px-3 py-1 rounded-lg">
            ${tournament.entryFee}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {tournament.name}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {tournament.description || 'Torneo de pádel competitivo.'}
        </p>

        {/* Información del torneo */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="truncate">{tournament.court?.name}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(tournament.startDate)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>
              {tournament.currentParticipants} / {tournament.maxParticipants} participantes
              {isFull && <span className="ml-2 text-red-600 font-medium">(COMPLETO)</span>}
            </span>
          </div>

          {tournament.prize && (
            <div className="flex items-center text-sm text-yellow-600 font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span>Premio: {tournament.prize}</span>
            </div>
          )}
        </div>

        {/* Estado de inscripción */}
        {registrationClosed && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg text-sm mb-4">
            Inscripciones cerradas
          </div>
        )}

        {isFull && !registrationClosed && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
            Torneo completo
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3">
          <Link
            to={`/torneos/${tournament._id || tournament.id}`}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center"
          >
            Ver Detalles
          </Link>

          {isRegistered ? (
            <button
              onClick={() => onUnregister && onUnregister(tournament._id || tournament.id)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
          ) : canRegister ? (
            <button
              onClick={() => onRegister && onRegister(tournament._id || tournament.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Inscribirse
            </button>
          ) : !isAuthenticated ? (
            <Link
              to="/login"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center"
            >
              Iniciar Sesión
            </Link>
          ) : (
            <button
              disabled
              className="flex-1 bg-gray-400 text-white font-medium py-2 px-4 rounded-lg cursor-not-allowed"
            >
              No Disponible
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TournamentCard