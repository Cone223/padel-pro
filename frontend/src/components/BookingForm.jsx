import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { bookingsApi } from '../api/bookingsApi'

const BookingForm = ({ court, onBookingSuccess, onCancel }) => {
  const { user } = useAuth()
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    duration: 1,
    players: [{ name: user?.name || '', email: user?.email || '' }],
    specialRequests: ''
  })

  useEffect(() => {
    if (court?._id) {
      fetchAvailability()
    }
  }, [court])

  const fetchAvailability = async (date = '') => {
    try {
      const response = await bookingsApi.getAvailability(court._id, date)
      setAvailability(response.data.data.availability)
    } catch (error) {
      console.error('Error fetching availability:', error)
    }
  }

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date, startTime: '' }))
    fetchAvailability(date)
  }

  const handlePlayerChange = (index, field, value) => {
    const updatedPlayers = [...formData.players]
    updatedPlayers[index][field] = value
    setFormData(prev => ({ ...prev, players: updatedPlayers }))
  }

  const addPlayer = () => {
    if (formData.players.length < 4) {
      setFormData(prev => ({
        ...prev,
        players: [...prev.players, { name: '', email: '' }]
      }))
    }
  }

  const removePlayer = (index) => {
    if (formData.players.length > 1) {
      const updatedPlayers = formData.players.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, players: updatedPlayers }))
    }
  }

  const getAvailableSlots = () => {
    const dayAvailability = availability.find(day => day.date === formData.date)
    return dayAvailability ? dayAvailability.slots : []
  }

  const calculateTotalPrice = () => {
    return (court.pricePerHour * formData.duration).toFixed(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const bookingData = {
        courtId: court._id,
        date: formData.date,
        startTime: formData.startTime,
        duration: formData.duration,
        players: formData.players.filter(player => player.name.trim() !== ''),
        specialRequests: formData.specialRequests
      }

      const response = await bookingsApi.create(bookingData)
      
      if (onBookingSuccess) {
        onBookingSuccess(response.data.data.booking)
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al crear la reserva')
    } finally {
      setLoading(false)
    }
  }

  const availableSlots = getAvailableSlots()
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Reservar Cancha</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Información de la cancha */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-lg mb-2">{court.name}</h3>
          <p className="text-gray-600">{court.address?.city}, {court.address?.street}</p>
          <p className="text-primary font-semibold">${court.pricePerHour} por hora</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Reserva
            </label>
            <input
              type="date"
              min={today}
              value={formData.date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Hora y Duración */}
          {formData.date && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Inicio
                </label>
                <select
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="">Seleccionar hora</option>
                  {availableSlots
                    .filter(slot => slot.available)
                    .map(slot => (
                      <option key={slot.time} value={slot.time}>
                        {slot.time} - {slot.endTime}
                      </option>
                    ))}
                </select>
                {availableSlots.filter(slot => slot.available).length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    No hay horarios disponibles para esta fecha
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (horas)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="input-field"
                >
                  {[1, 2, 3, 4].map(hours => (
                    <option key={hours} value={hours}>
                      {hours} hora{hours > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Jugadores */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Jugadores
              </label>
              {formData.players.length < 4 && (
                <button
                  type="button"
                  onClick={addPlayer}
                  className="text-sm text-primary hover:text-green-700 font-medium"
                >
                  + Agregar jugador
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {formData.players.map((player, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nombre del jugador"
                      value={player.name}
                      onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                      className="input-field"
                      required={index === 0}
                    />
                    <input
                      type="email"
                      placeholder="Email (opcional)"
                      value={player.email}
                      onChange={(e) => handlePlayerChange(index, 'email', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removePlayer(index)}
                      className="text-red-500 hover:text-red-700 mt-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Solicitudes especiales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Solicitudes Especiales (opcional)
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
              rows={3}
              className="input-field"
              placeholder="Alguna solicitud especial para tu reserva..."
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.specialRequests.length}/500 caracteres
            </p>
          </div>

          {/* Resumen y precio */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Precio por hora:</span>
              <span>${court.pricePerHour}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Duración:</span>
              <span>{formData.duration} hora{formData.duration > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
              <span>Total:</span>
              <span className="text-primary">${calculateTotalPrice()}</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 hover:bg-gray-400 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.date || !formData.startTime}
              className="flex-1 btn-primary py-3 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingForm