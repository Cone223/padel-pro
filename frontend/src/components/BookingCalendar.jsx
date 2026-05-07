// frontend/src/components/BookingCalendar.jsx
import React, { useState, useEffect } from 'react'
import { bookingsApi } from '../api/bookingsApi'

const BookingCalendar = ({ court, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [availableSlots, setAvailableSlots] = useState({})
  const [loading, setLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Generar los próximos 30 días
  const generateCalendarDays = () => {
    const days = []
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push(date)
    }
    
    return days
  }

  // Horarios disponibles (8:00 AM - 12:00 AM)
  const timeSlots = []
  for (let hour = 8; hour <= 24; hour++) {
    timeSlots.push({
      time: `${hour}:00`,
      display: `${hour}:00`
    })
  }

  // Obtener disponibilidad para una fecha
  const fetchAvailability = async (date) => {
    try {
      setLoading(true)
      const response = await bookingsApi.getAvailability(court._id, date.toISOString().split('T')[0])
      setAvailableSlots(prev => ({
        ...prev,
        [date.toISOString().split('T')[0]]: response.data.data.availableSlots
      }))
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  // Formatear fecha
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    })
  }

  // Verificar si un horario está disponible
  const isTimeSlotAvailable = (date, time) => {
    const dateKey = date.toISOString().split('T')[0]
    return availableSlots[dateKey]?.includes(time) !== false
  }

  // Manejar selección de fecha
  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    
    // Si no tenemos la disponibilidad para esta fecha, la obtenemos
    const dateKey = date.toISOString().split('T')[0]
    if (!availableSlots[dateKey]) {
      fetchAvailability(date)
    }
  }

  // Manejar reserva
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return

    try {
      setLoading(true)
      await bookingsApi.create({
        court: court._id,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        duration: 60 // 1 hora por defecto
      })
      setBookingSuccess(true)
      
      // Actualizar disponibilidad
      setTimeout(() => {
        fetchAvailability(selectedDate)
        setSelectedTime(null)
        setBookingSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Error al realizar la reserva. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Reservar Cancha</h2>
              <p className="text-green-100">{court.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Calendario */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Selecciona una fecha</h3>
            <div className="grid grid-cols-5 md:grid-cols-7 gap-2">
              {calendarDays.map((date, index) => {
                const dateKey = date.toISOString().split('T')[0]
                const isToday = date.toDateString() === new Date().toDateString()
                const isSelected = selectedDate?.toDateString() === date.toDateString()
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      isSelected
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : isToday
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {formatDate(date)}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Horarios */}
          {selectedDate && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                Horarios disponibles para {formatDate(selectedDate)}
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {timeSlots.map((slot, index) => {
                    const isAvailable = isTimeSlotAvailable(selectedDate, slot.time)
                    const isSelected = selectedTime === slot.time
                    
                    return (
                      <button
                        key={index}
                        onClick={() => isAvailable && setSelectedTime(slot.time)}
                        disabled={!isAvailable}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-500 text-white'
                            : isAvailable
                            ? 'border-gray-200 hover:border-green-500 hover:bg-green-50 text-gray-700'
                            : 'border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {slot.display}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Resumen y Confirmación */}
          {selectedDate && selectedTime && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Resumen de Reserva</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Cancha:</span>
                  <span className="font-medium">{court.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span className="font-medium">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Horario:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duración:</span>
                  <span className="font-medium">1 hora</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">${court.pricePerHour}</span>
                </div>
              </div>

              {bookingSuccess ? (
                <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  ¡Reserva confirmada! Recibirás un email de confirmación.
                </div>
              ) : (
                <button
                  onClick={handleBooking}
                  disabled={loading}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : 'Confirmar Reserva'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingCalendar