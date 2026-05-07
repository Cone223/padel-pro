import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { courtsApi } from '../services/api'
import { useToast } from '../context/ToastContext'

const CourtCard = ({ court }) => (
  <Link to={`/cancha/${court._id}`} className="card-hover group overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-300">
    <div className="aspect-video bg-dark-700 overflow-hidden relative">
      {court.images?.[0] ? (
        <img src={court.images[0]} alt={court.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl text-dark-500">🎾</div>
      )}
      {!court.isActive && (
        <div className="absolute inset-0 bg-dark-900/80 flex items-center justify-center">
          <span className="badge-red">No disponible</span>
        </div>
      )}
      <div className="absolute top-3 right-3">
        <span className="badge-green">${court.pricePerHour}/h</span>
      </div>
    </div>
    <div className="p-5 flex flex-col gap-3 flex-1">
      <div>
        <h3 className="text-white font-semibold text-lg group-hover:text-brand-400 transition-colors">{court.name}</h3>
        <p className="text-dark-300 text-sm mt-1 flex items-center gap-1">
          📍 {court.address?.city || 'Sin ubicación'}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap mt-auto">
        <span className="badge-gray">{court.courtType}</span>
        {court.facilities?.slice(0, 2).map(f => (
          <span key={f} className="badge-gray capitalize">{f}</span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-dark-600">
        <div className="flex items-center gap-1 text-yellow-400 text-sm">
          ⭐ {court.rating?.toFixed(1) || '5.0'}
        </div>
        <span className="text-brand-400 text-sm font-medium group-hover:gap-2 transition-all">Ver detalles →</span>
      </div>
    </div>
  </Link>
)

export default function Canchas() {
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ city: '', minPrice: '', maxPrice: '', type: '' })
  const [total, setTotal] = useState(0)
  const toast = useToast()

  useEffect(() => { fetchCourts() }, [])

  const fetchCourts = async (params = {}) => {
    try {
      setLoading(true)
      const { data } = await courtsApi.getAll({ ...filters, ...params })
      setCourts(data.data.courts)
      setTotal(data.data.total)
    } catch (error) {
      toast.error('Error al cargar canchas.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchCourts()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title mb-2">Canchas disponibles</h1>
        <p className="text-dark-300">{total} canchas encontradas</p>
      </div>

      {/* Filters */}
      <div className="card p-5 mb-8">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="label">Ciudad</label>
            <input className="input" placeholder="Buenos Aires..." value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} />
          </div>
          <div className="w-32">
            <label className="label">Precio min.</label>
            <input className="input" type="number" placeholder="$0" value={filters.minPrice} onChange={e => setFilters({ ...filters, minPrice: e.target.value })} />
          </div>
          <div className="w-32">
            <label className="label">Precio max.</label>
            <input className="input" type="number" placeholder="$999" value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} />
          </div>
          <div className="w-40">
            <label className="label">Tipo</label>
            <select className="input" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
              <option value="">Todos</option>
              <option value="cristal">Cristal</option>
              <option value="hormigon">Hormigón</option>
              <option value="cesped artificial">Césped artificial</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Buscar</button>
          <button type="button" onClick={() => { setFilters({ city: '', minPrice: '', maxPrice: '', type: '' }); fetchCourts({ city: '', minPrice: '', maxPrice: '', type: '' }) }} className="btn-secondary">
            Limpiar
          </button>
        </form>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton aspect-video" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : courts.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🎾</div>
          <h3 className="text-white font-semibold text-xl mb-2">No hay canchas disponibles</h3>
          <p className="text-dark-300">Intentá con otros filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map(court => <CourtCard key={court._id} court={court} />)}
        </div>
      )}
    </div>
  )
}
