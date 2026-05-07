import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tournamentsApi } from '../services/api'
import { useToast } from '../context/ToastContext'

const TournamentCard = ({ t }) => {
  const isFull = t.currentParticipants >= t.maxParticipants
  const categoryColors = { principiante: 'badge-green', intermedio: 'badge-blue', avanzado: 'badge-red' }
  return (
    <Link to={`/torneo/${t._id}`} className="card-hover group p-6 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-2xl">🏆</div>
        <span className={categoryColors[t.category] || 'badge-gray'}>{t.category}</span>
      </div>
      <div className="flex-1">
        <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-brand-400 transition-colors">{t.name}</h3>
        <p className="text-dark-300 text-sm line-clamp-2 mb-3">{t.description || 'Sin descripción disponible.'}</p>
        <div className="space-y-1.5 text-sm text-dark-300">
          <div className="flex items-center gap-2">📅 {new Date(t.startDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <div className="flex items-center gap-2">👥 {t.currentParticipants}/{t.maxParticipants} inscriptos</div>
          {t.entryFee > 0 && <div className="flex items-center gap-2">💰 Inscripción: ${t.entryFee}</div>}
        </div>
      </div>
      <div className="w-full bg-dark-600 rounded-full h-1.5">
        <div className="bg-brand-500 h-1.5 rounded-full transition-all" style={{ width: `${(t.currentParticipants / t.maxParticipants) * 100}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className={isFull ? 'badge-red' : 'badge-green'}>{isFull ? 'Completo' : 'Lugares disponibles'}</span>
        <span className="text-brand-400 text-sm group-hover:gap-2 transition-all">Ver torneo →</span>
      </div>
    </Link>
  )
}

export default function Torneos() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const toast = useToast()

  useEffect(() => { fetchTournaments() }, [category])

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      const { data } = await tournamentsApi.getAll({ category, status: 'active' })
      setTournaments(data.data.tournaments)
    } catch (error) {
      toast.error('Error al cargar torneos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title mb-1">Torneos</h1>
          <p className="text-dark-300">Competí y demostrá tu nivel</p>
        </div>
        <div className="flex gap-2">
          {['', 'principiante', 'intermedio', 'avanzado'].map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${category === c ? 'bg-brand-500 text-white' : 'bg-dark-700 text-dark-300 hover:text-white'}`}>
              {c || 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="card p-6 space-y-4"><div className="skeleton h-12 w-12 rounded-xl" /><div className="skeleton h-5 w-3/4" /><div className="skeleton h-16" /></div>)}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-white font-semibold text-xl mb-2">No hay torneos disponibles</h3>
          <p className="text-dark-300">Próximamente se añadirán nuevos torneos.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map(t => <TournamentCard key={t._id} t={t} />)}
        </div>
      )}
    </div>
  )
}
