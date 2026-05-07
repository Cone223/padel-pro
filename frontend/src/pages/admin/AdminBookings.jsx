import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const StatusBadge = ({ status }) => {
  const map = {
    pending: 'badge-yellow',
    confirmed: 'badge-green',
    cancelled: 'badge-red',
    completed: 'badge-gray',
  }
  const labels = { pending: 'Pendiente', confirmed: 'Confirmado', cancelled: 'Cancelado', completed: 'Completado' }
  return <span className={map[status] || 'badge-gray'}>{labels[status] || status}</span>
}

export default function AdminBookings() {
  const toast = useToast()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', date: '' })
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [updating, setUpdating] = useState(null)

  useEffect(() => { fetchBookings() }, [page, filters])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const { data } = await adminApi.getAllBookings({ page, limit: 15, ...filters })
      setBookings(data.data.bookings)
      setTotal(data.data.total)
      setPages(data.data.pages)
    } catch { toast.error('Error al cargar reservas.') }
    finally { setLoading(false) }
  }

  const handleStatusChange = async (id, status) => {
    setUpdating(id)
    try {
      const { data } = await adminApi.updateBookingStatus(id, status)
      setBookings(prev => prev.map(b => b._id === id ? data.data.booking : b))
      toast.success('Estado actualizado.')
    } catch { toast.error('Error al actualizar.') }
    finally { setUpdating(null) }
  }

  const STATUSES = ['', 'pending', 'confirmed', 'cancelled', 'completed']
  const STATUS_LABELS = { '': 'Todos', pending: 'Pendiente', confirmed: 'Confirmado', cancelled: 'Cancelado', completed: 'Completado' }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/admin" className="btn-ghost py-1 px-2">← Admin</Link>
        <span className="text-dark-500">/</span>
        <span className="text-dark-300 text-sm">Reservas</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reservas</h1>
          <p className="text-dark-300 text-sm mt-1">{total} reservas en total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex gap-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setFilters(f => ({ ...f, status: s })); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filters.status === s ? 'bg-brand-500 text-white' : 'bg-dark-700 text-dark-300 hover:text-white'}`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div>
          <label className="label text-xs">Fecha</label>
          <input type="date" className="input py-1.5 text-sm" value={filters.date}
            onChange={e => { setFilters(f => ({ ...f, date: e.target.value })); setPage(1) }} />
        </div>
        {(filters.date || filters.status) && (
          <button onClick={() => { setFilters({ status: '', date: '' }); setPage(1) }} className="btn-ghost text-xs">
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600 bg-dark-700/50">
                {['Usuario', 'Cancha', 'Fecha', 'Horario', 'Total', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-dark-300 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>{Array(7).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>)}</tr>
                ))
              ) : bookings.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-dark-400">No hay reservas con los filtros seleccionados.</td></tr>
              ) : (
                bookings.map(b => (
                  <tr key={b._id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-medium">{b.user?.name || '—'}</p>
                        <p className="text-dark-400 text-xs">{b.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dark-300 text-sm">{b.court?.name || '—'}</td>
                    <td className="px-4 py-3 text-dark-300 text-sm whitespace-nowrap">
                      {b.date ? new Date(b.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-dark-300 text-sm whitespace-nowrap">{b.startTime} – {b.endTime}</td>
                    <td className="px-4 py-3 text-white font-semibold text-sm">${b.totalPrice}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      {b.status === 'pending' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleStatusChange(b._id, 'confirmed')}
                            disabled={updating === b._id}
                            className="text-xs px-2.5 py-1 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 rounded-lg transition-all font-medium"
                          >
                            {updating === b._id ? '...' : '✓ Confirmar'}
                          </button>
                          <button
                            onClick={() => handleStatusChange(b._id, 'cancelled')}
                            disabled={updating === b._id}
                            className="text-xs px-2.5 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all font-medium"
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(b._id, 'completed')}
                          disabled={updating === b._id}
                          className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all font-medium"
                        >
                          Completar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="px-4 py-4 border-t border-dark-700 flex items-center justify-between">
            <span className="text-dark-400 text-sm">Página {page} de {pages} · {total} reservas</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1 px-3 text-xs disabled:opacity-40">Anterior</button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary py-1 px-3 text-xs disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
