import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { courtsApi, bookingsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getImageUrl } from '../utils/imageUrl'

const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 8
  return { label: `${h.toString().padStart(2, '0')}:00`, value: `${h.toString().padStart(2, '0')}:00` }
})

export default function CanchaDetalle() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [court, setCourt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [availability, setAvailability] = useState([])
  const [booking, setBooking] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    duration: 1,
  })
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    courtsApi.getById(id).then(({ data }) => {
      setCourt(data.data.court)
      setLoading(false)
    }).catch(() => { toast.error('Cancha no encontrada.'); navigate('/canchas') })
  }, [id])

  useEffect(() => {
    if (booking.date) {
      bookingsApi.getAvailability(id, booking.date).then(({ data }) => {
        setAvailability(data.data.bookings)
      }).catch(() => {})
    }
  }, [booking.date, id])

  const isTimeBooked = (time) => {
    return availability.some(b => {
      const start = b.startTime
      const end = b.endTime
      return time >= start && time < end
    })
  }

  const endTime = () => {
    const [h] = booking.startTime.split(':').map(Number)
    return `${(h + booking.duration).toString().padStart(2, '0')}:00`
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return navigate('/login', { state: { from: `/cancha/${id}` } })
    setBookingLoading(true)
    try {
      await bookingsApi.create({
        courtId: id,
        date: booking.date,
        startTime: booking.startTime,
        endTime: endTime(),
        duration: booking.duration,
      })
      toast.success('¡Reserva creada exitosamente!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear la reserva.')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="skeleton h-80 rounded-2xl mb-8" />
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="skeleton h-8 w-2/3" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-32" />
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    </div>
  )

  if (!court) return null
  const totalPrice = court.pricePerHour * booking.duration

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/canchas" className="btn-ghost mb-6 inline-flex">← Volver a canchas</Link>

      {/* Image gallery */}
      <div className="card overflow-hidden mb-8">
        <div className="aspect-[16/6] relative bg-dark-700">
          {court.images?.length > 0 ? (
            <img src={getImageUrl(court.images[imgIdx])} alt={court.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl text-dark-600">🎾</div>
          )}
          {court.images?.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {court.images.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? 'bg-brand-400 w-6' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-3xl font-bold text-white">{court.name}</h1>
              <div className="flex items-center gap-1 text-yellow-400">
                ⭐ <span className="font-semibold">{court.rating?.toFixed(1) || '5.0'}</span>
              </div>
            </div>
            <p className="text-dark-300 flex items-center gap-2">📍 {court.address?.street}, {court.address?.city}</p>
          </div>

          {court.description && (
            <div className="card p-5">
              <h3 className="text-white font-semibold mb-3">Descripción</h3>
              <p className="text-dark-300 leading-relaxed">{court.description}</p>
            </div>
          )}

          <div className="card p-5">
            <h3 className="text-white font-semibold mb-4">Detalles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-dark-400 text-sm">Tipo de cancha</span><p className="text-white font-medium capitalize mt-1">{court.courtType}</p></div>
              <div><span className="text-dark-400 text-sm">Horario</span><p className="text-white font-medium mt-1">{court.operatingHours?.open || '08:00'} - {court.operatingHours?.close || '22:00'}</p></div>
              <div><span className="text-dark-400 text-sm">Precio por hora</span><p className="text-brand-400 font-bold text-xl mt-1">${court.pricePerHour}</p></div>
            </div>
          </div>

          {court.facilities?.length > 0 && (
            <div className="card p-5">
              <h3 className="text-white font-semibold mb-4">Instalaciones</h3>
              <div className="flex flex-wrap gap-2">
                {court.facilities.map(f => (
                  <span key={f} className="badge-green capitalize">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking form */}
        <div className="md:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="mb-5">
              <span className="text-3xl font-bold text-white">${court.pricePerHour}</span>
              <span className="text-dark-300 text-sm">/hora</span>
            </div>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="label">Fecha</label>
                <input type="date" className="input" min={new Date().toISOString().split('T')[0]}
                  value={booking.date} onChange={e => setBooking({ ...booking, date: e.target.value })} />
              </div>
              <div>
                <label className="label">Hora de inicio</label>
                <select className="input" value={booking.startTime} onChange={e => setBooking({ ...booking, startTime: e.target.value })}>
                  {HOURS.map(h => (
                    <option key={h.value} value={h.value} disabled={isTimeBooked(h.value)}>
                      {h.label} {isTimeBooked(h.value) ? '(Ocupado)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Duración</label>
                <select className="input" value={booking.duration} onChange={e => setBooking({ ...booking, duration: Number(e.target.value) })}>
                  <option value={1}>1 hora</option>
                  <option value={1.5}>1.5 horas</option>
                  <option value={2}>2 horas</option>
                </select>
              </div>
              <div className="py-3 border-y border-dark-600 flex justify-between items-center">
                <span className="text-dark-300 text-sm">Total estimado</span>
                <span className="text-white font-bold text-xl">${totalPrice}</span>
              </div>
              <button type="submit" disabled={bookingLoading || !court.isActive} className="btn-primary w-full justify-center py-3">
                {bookingLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Reservando...</>
                  : !isAuthenticated ? 'Iniciar sesión para reservar'
                  : !court.isActive ? 'Cancha no disponible'
                  : 'Confirmar reserva'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
