import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tournamentsApi, courtsApi } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const TournamentModal = ({ tournament, courts, onClose, onSave }) => {
  const toast = useToast()
  const [form, setForm] = useState({
    name: tournament?.name || '',
    description: tournament?.description || '',
    court: tournament?.court?._id || tournament?.court || '',
    startDate: tournament?.startDate ? tournament.startDate.split('T')[0] : '',
    registrationDeadline: tournament?.registrationDeadline ? tournament.registrationDeadline.split('T')[0] : '',
    maxParticipants: tournament?.maxParticipants || 16,
    category: tournament?.category || 'principiante',
    entryFee: tournament?.entryFee || 0,
    prize: tournament?.prize || '',
    rules: tournament?.rules || '',
    isActive: tournament?.isActive ?? true,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.startDate || !form.court) return toast.error('Completá los campos obligatorios.')
    setLoading(true)
    try {
      if (tournament) await tournamentsApi.update(tournament._id, form)
      else await tournamentsApi.create(form)
      toast.success(tournament ? 'Torneo actualizado.' : 'Torneo creado exitosamente.')
      onSave()
    } catch (error) { toast.error(error.response?.data?.message || 'Error al guardar.') }
    finally { setLoading(false) }
  }

  const Field = ({ label, name, type = 'text', placeholder, children, required }) => (
    <div>
      <label className="label">{label} {required && <span className="text-red-400">*</span>}</label>
      {children || (
        <input type={type} className="input" placeholder={placeholder}
          value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} />
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-dark-700 sticky top-0 bg-dark-800 z-10">
          <h2 className="text-white font-bold text-xl">{tournament ? 'Editar torneo' : 'Nuevo torneo'}</h2>
          <button onClick={onClose} className="text-dark-400 hover:text-white text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Nombre del torneo" name="name" placeholder="Copa Primavera 2024" required />
            </div>
            <div className="col-span-2">
              <label className="label">Cancha <span className="text-red-400">*</span></label>
              <select className="input" value={form.court} onChange={e => setForm(f => ({ ...f, court: e.target.value }))}>
                <option value="">Seleccioná una cancha...</option>
                {courts.map(c => <option key={c._id} value={c._id}>{c.name} — {c.address?.city}</option>)}
              </select>
            </div>
            <Field label="Fecha de inicio" name="startDate" type="date" required />
            <Field label="Fecha límite inscripción" name="registrationDeadline" type="date" />
            <div>
              <label className="label">Categoría <span className="text-red-400">*</span></label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {['principiante', 'intermedio', 'avanzado'].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Máx. participantes</label>
              <input type="number" className="input" min={2} max={256} value={form.maxParticipants}
                onChange={e => setForm(f => ({ ...f, maxParticipants: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="label">Inscripción ($)</label>
              <input type="number" className="input" min={0} placeholder="0" value={form.entryFee}
                onChange={e => setForm(f => ({ ...f, entryFee: Number(e.target.value) }))} />
            </div>
            <Field label="Premio" name="prize" placeholder="Trofeo + $50.000" />
            <div className="col-span-2">
              <label className="label">Descripción</label>
              <textarea className="input h-20 resize-none" placeholder="Describí el torneo..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="label">Reglas</label>
              <textarea className="input h-20 resize-none" placeholder="Reglas del torneo..."
                value={form.rules} onChange={e => setForm(f => ({ ...f, rules: e.target.value }))} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`relative w-10 h-6 rounded-full transition-colors ${form.isActive ? 'bg-brand-500' : 'bg-dark-600'}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-4' : ''}`} />
            </button>
            <span className="text-sm text-dark-300">Torneo activo (visible e inscripciones abiertas)</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</> : tournament ? 'Actualizar' : 'Crear torneo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminTournaments() {
  const toast = useToast()
  const [tournaments, setTournaments] = useState([])
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [tRes, cRes] = await Promise.all([tournamentsApi.getAll(), courtsApi.getAll({ limit: 100 })])
      setTournaments(tRes.data.data.tournaments)
      setCourts(cRes.data.data.courts)
    } catch { toast.error('Error al cargar datos.') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar el torneo "${name}"?`)) return
    try {
      await tournamentsApi.delete(id)
      setTournaments(prev => prev.filter(t => t._id !== id))
      toast.success('Torneo eliminado.')
    } catch (error) { toast.error(error.response?.data?.message || 'Error al eliminar.') }
  }

  const categoryColors = { principiante: 'badge-green', intermedio: 'badge-blue', avanzado: 'badge-red' }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/admin" className="btn-ghost py-1 px-2">← Admin</Link>
        <span className="text-dark-500">/</span>
        <span className="text-dark-300 text-sm">Torneos</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Torneos</h1>
          <p className="text-dark-300 text-sm mt-1">{tournaments.length} torneos creados</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary">+ Nuevo torneo</button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : tournaments.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-white font-semibold mb-2">No hay torneos creados</h3>
          <button onClick={() => setModal('new')} className="btn-primary mt-4">Crear primer torneo</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600 bg-dark-700/50">
                {['Torneo', 'Categoría', 'Fecha', 'Participantes', 'Inscripción', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-dark-300 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {tournaments.map(t => (
                <tr key={t._id} className="hover:bg-dark-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-lg">🏆</div>
                      <div>
                        <p className="text-white text-sm font-medium">{t.name}</p>
                        <p className="text-dark-400 text-xs">{t.court?.name || 'Sin cancha'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={categoryColors[t.category] || 'badge-gray'}>{t.category}</span></td>
                  <td className="px-4 py-3 text-dark-300 text-sm whitespace-nowrap">
                    {new Date(t.startDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-dark-600 rounded-full h-1.5">
                        <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${(t.currentParticipants / t.maxParticipants) * 100}%` }} />
                      </div>
                      <span className="text-dark-300 text-xs">{t.currentParticipants}/{t.maxParticipants}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dark-300 text-sm">{t.entryFee > 0 ? `$${t.entryFee}` : 'Gratis'}</td>
                  <td className="px-4 py-3">
                    <span className={t.isActive ? 'badge-green' : 'badge-red'}>{t.isActive ? 'Activo' : 'Inactivo'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setModal(t)} className="text-xs px-2.5 py-1 bg-dark-700 hover:bg-dark-600 text-dark-200 rounded-lg transition-all">Editar</button>
                      <button onClick={() => handleDelete(t._id, t.name)} className="text-xs px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <TournamentModal
          tournament={modal === 'new' ? null : modal}
          courts={courts}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchAll() }}
        />
      )}
    </div>
  )
}
