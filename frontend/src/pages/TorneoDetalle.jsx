import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { tournamentsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function TorneoDetalle() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    tournamentsApi.getById(id).then(({ data }) => {
      setTournament(data.data.tournament)
      setLoading(false)
    }).catch(() => { toast.error('Torneo no encontrado.'); navigate('/torneos') })
  }, [id])

  const isJoined = tournament?.participants?.some(p => p.user?._id === user?._id || p.user === user?._id)

  const handleJoin = async () => {
    if (!isAuthenticated) return navigate('/login')
    setJoining(true)
    try {
      await tournamentsApi.join(id)
      toast.success('¡Te inscribiste en el torneo!')
      const { data } = await tournamentsApi.getById(id)
      setTournament(data.data.tournament)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al inscribirse.')
    } finally { setJoining(false) }
  }

  const handleLeave = async () => {
    setLeaving(true)
    try {
      await tournamentsApi.leave(id)
      toast.success('Te desinscribiste del torneo.')
      const { data } = await tournamentsApi.getById(id)
      setTournament(data.data.tournament)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al desinscribirse.')
    } finally { setLeaving(false) }
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8 space-y-4"><div className="skeleton h-8 w-1/2" /><div className="skeleton h-64" /></div>
  if (!tournament) return null

  const isFull = tournament.currentParticipants >= tournament.maxParticipants
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/torneos" className="btn-ghost mb-6 inline-flex">← Volver a torneos</Link>
      <div className="card p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-3xl">🏆</div>
              <div>
                <h1 className="text-2xl font-bold text-white">{tournament.name}</h1>
                <span className={`badge mt-1 ${tournament.category === 'principiante' ? 'badge-green' : tournament.category === 'intermedio' ? 'badge-blue' : 'badge-red'}`}>{tournament.category}</span>
              </div>
            </div>
            {tournament.description && <p className="text-dark-300 mb-6 leading-relaxed">{tournament.description}</p>}
            <div className="grid grid-cols-2 gap-4">
              {[
                ['📅 Fecha inicio', new Date(tournament.startDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })],
                ['👥 Participantes', `${tournament.currentParticipants}/${tournament.maxParticipants}`],
                ['💰 Inscripción', tournament.entryFee > 0 ? `$${tournament.entryFee}` : 'Gratis'],
                ['🏟️ Cancha', tournament.court?.name || 'Por confirmar'],
              ].map(([k, v]) => (
                <div key={k} className="bg-dark-700 rounded-lg p-3">
                  <div className="text-dark-400 text-xs">{k}</div>
                  <div className="text-white font-medium mt-1">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-52 flex flex-col gap-3">
            {isJoined ? (
              <>
                <div className="badge-green text-center py-2 px-4 rounded-lg">✓ Inscripto</div>
                <button onClick={handleLeave} disabled={leaving} className="btn-danger justify-center">
                  {leaving ? 'Saliendo...' : 'Desinscribirse'}
                </button>
              </>
            ) : (
              <button onClick={handleJoin} disabled={joining || isFull || !tournament.isActive} className="btn-primary justify-center py-3 w-full">
                {joining ? 'Inscribiendo...' : isFull ? 'Torneo lleno' : 'Inscribirme'}
              </button>
            )}
            <div className="text-center text-dark-300 text-xs">{tournament.maxParticipants - tournament.currentParticipants} lugares disponibles</div>
          </div>
        </div>
      </div>

      {/* Participants */}
      {tournament.participants?.length > 0 && (
        <div className="card p-6">
          <h2 className="text-white font-semibold text-lg mb-4">Participantes ({tournament.participants.length})</h2>
          <div className="space-y-2">
            {tournament.participants.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-400">
                  {i + 1}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{p.user?.name || 'Participante'}</p>
                  {p.partner?.name && <p className="text-dark-400 text-xs">Compañero: {p.partner.name}</p>}
                </div>
                <div className="ml-auto text-dark-400 text-xs">{new Date(p.registeredAt).toLocaleDateString('es-AR')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
