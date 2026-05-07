import React from 'react'
import { Link } from 'react-router-dom'

const Ganadores = () => {
  // Datos de ejemplo de ganadores de torneos
  const winnersData = [
    {
      id: 1,
      tournament: 'Torneo Anual Club Norte',
      date: '15 Nov 2024',
      category: 'Intermedio',
      winners: {
        first: { name: 'Martin Garcia  ', partner: 'Ana López', club: 'Club Norte' },
        second: { name: 'Carlos Rodríguez', partner: 'Maria Fernández', club: 'Club Centro' },
        third: { name: 'Diego Martinez', partner: 'Laura Sánchez', club: 'Club Premium' }
      },
      prize: '$50,000',
      image: '/default-tournament.jpg'
    },
    {
      id: 2,
      tournament: 'Copa Invierno Club Centro',
      date: '8 Nov 2024',
      category: 'Principiante',
      winners: {
        first: { name: 'Sofía Ramírez', partner: 'Juan Pérez', club: 'Club Centro' },
        second: { name: 'Miguel Ángel Torres', partner: 'Elena Gómez', club: 'Club Norte' },
        third: { name: 'Roberto Silva', partner: 'Claudia Díaz', club: 'Club Sur' }
      },
      prize: '$25,000',
      image: '/default-tournament.jpg'
    },
    {
      id: 3,
      tournament: 'Torneo Premium Masters',
      date: '1 Nov 2024',
      category: 'Avanzado',
      winners: {
        first: { name: 'Alejandro Ruiz', partner: 'Patricia Morales', club: 'Club Premium' },
        second: { name: 'Fernando Castro', partner: 'Isabel Vargas', club: 'Club Norte' },
        third: { name: 'Ricardo Ortega', partner: 'Carmen Reyes', club: 'Club Centro' }
      },
      prize: '$80,000',
      image: '/default-tournament.jpg'
    },
    {
      id: 4,
      tournament: 'Torneo Verano Club Sur',
      date: '25 Oct 2024',
      category: 'Intermedio',
      winners: {
        first: { name: 'Gabriel Mendoza', partner: 'Andrea Castro', club: 'Club Sur' },
        second: { name: 'Oscar Herrera', partner: 'Daniela Paredes', club: 'Club Premium' },
        third: { name: 'Santiago Ríos', partner: 'Valentina Mora', club: 'Club Centro' }
      },
      prize: '$35,000',
      image: '/default-tournament.jpg'
    }
  ]

  const getMedalIcon = (position) => {
    switch (position) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return '🏆'
    }
  }

  const getPositionColor = (position) => {
    switch (position) {
      case 1: return 'bg-yellow-50 border-yellow-200'
      case 2: return 'bg-gray-50 border-gray-200'
      case 3: return 'bg-orange-50 border-orange-200'
      default: return 'bg-white border-gray-200'
    }
  }

  const topPlayers = [
    { name: 'Martin Garcia', wins: 3, club: 'Club Norte', avatar: '👑' },
    { name: 'Sofía Ramírez', wins: 2, club: 'Club Centro', avatar: '💫' },
    { name: 'Alejandro Ruiz', wins: 2, club: 'Club Premium', avatar: '🔥' },
    { name: 'Gabriel Mendoza', wins: 1, club: 'Club Sur', avatar: '⭐' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tabla de Ganadores
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Reconocimiento a los mejores jugadores de los torneos organizados en nuestra plataforma
          </p>
        </div>

        {/* Lista de Torneos con Ganadores */}
        <div className="space-y-8">
          {winnersData.map((tournament) => (
            <div key={tournament.id} className="card overflow-hidden">
              {/* Header del Torneo */}
              <div className="bg-gradient-to-r from-primary to-green-600 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{tournament.tournament}</h2>
                    <div className="flex items-center space-x-4 mt-2 text-green-100">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        {tournament.date}
                      </span>
                      <span className="px-2 py-1 bg-green-500 bg-opacity-20 rounded-full text-sm">
                        {tournament.category}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                        </svg>
                        Premio: {tournament.prize}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Primer Puesto */}
                  <div className={`border-2 border-yellow-300 rounded-lg p-4 ${getPositionColor(1)}`}>
                    <div className="text-center">
                      <div className="text-3xl mb-2">{getMedalIcon(1)}</div>
                      <div className="text-sm font-semibold text-yellow-600 mb-1">PRIMER PUESTO</div>
                      <h3 className="font-bold text-lg text-gray-900">{tournament.winners.first.name}</h3>
                      <p className="text-gray-600 text-sm">y {tournament.winners.first.partner}</p>
                      <div className="mt-2 text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded-full">
                        {tournament.winners.first.club}
                      </div>
                    </div>
                  </div>

                  {/* Segundo Puesto */}
                  <div className={`border-2 border-gray-300 rounded-lg p-4 ${getPositionColor(2)}`}>
                    <div className="text-center">
                      <div className="text-3xl mb-2">{getMedalIcon(2)}</div>
                      <div className="text-sm font-semibold text-gray-600 mb-1">SEGUNDO PUESTO</div>
                      <h3 className="font-bold text-lg text-gray-900">{tournament.winners.second.name}</h3>
                      <p className="text-gray-600 text-sm">y {tournament.winners.second.partner}</p>
                      <div className="mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {tournament.winners.second.club}
                      </div>
                    </div>
                  </div>

                  {/* Tercer Puesto */}
                  <div className={`border-2 border-orange-300 rounded-lg p-4 ${getPositionColor(3)}`}>
                    <div className="text-center">
                      <div className="text-3xl mb-2">{getMedalIcon(3)}</div>
                      <div className="text-sm font-semibold text-orange-600 mb-1">TERCER PUESTO</div>
                      <h3 className="font-bold text-lg text-gray-900">{tournament.winners.third.name}</h3>
                      <p className="text-gray-600 text-sm">y {tournament.winners.third.partner}</p>
                      <div className="mt-2 text-xs text-gray-500 bg-orange-100 px-2 py-1 rounded-full">
                        {tournament.winners.third.club}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Jugadores Destacados */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Jugadores Destacados de la Temporada
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topPlayers.map((player, index) => (
              <div key={index} className="card p-6 text-center hover:shadow-lg transition-shadow duration-200">
                <div className="text-4xl mb-3">{player.avatar}</div>
                <div className="text-xl font-bold text-primary mb-1">{player.name}</div>
                <div className="text-gray-600 text-sm mb-2">{player.wins} torneo{player.wins > 1 ? 's' : ''} ganado{player.wins > 1 ? 's' : ''}</div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {player.club}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="card p-8 bg-gradient-to-r from-primary to-green-600 text-white">
            <h3 className="text-2xl font-bold mb-4">¿Quieres aparecer en esta tabla?</h3>
            <p className="text-green-100 mb-6">
              Participa en los torneos organizados por nuestros clubs asociados y demuestra tu talento
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/torneos"
                className="bg-white text-primary hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Ver Torneos Activos
              </Link>
              <Link
                to="/canchas"
                className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Encontrar Canchas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ganadores