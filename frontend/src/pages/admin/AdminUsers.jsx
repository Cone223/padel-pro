import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const RoleBadge = ({ role }) => {
  const map = { admin: 'badge-green', owner: 'badge-blue', user: 'badge-gray' }
  return <span className={map[role] || 'badge-gray'}>{role}</span>
}

const StatusDot = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${isActive ? 'text-brand-400' : 'text-red-400'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-brand-400' : 'bg-red-400'}`} />
    {isActive ? 'Activo' : 'Suspendido'}
  </span>
)

export default function AdminUsers() {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { fetchUsers() }, [page, roleFilter])

  const fetchUsers = async (searchVal = search) => {
    try {
      setLoading(true)
      const { data } = await adminApi.getUsers({ page, limit: 15, search: searchVal, role: roleFilter })
      setUsers(data.data.users)
      setTotal(data.data.total)
      setPages(data.data.pages)
    } catch { toast.error('Error al cargar usuarios.') }
    finally { setLoading(false) }
  }

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchUsers(search) }

  const handleToggle = async (userId) => {
    setActionLoading(userId + '-toggle')
    try {
      const { data } = await adminApi.toggleUser(userId)
      setUsers(prev => prev.map(u => u._id === userId ? data.data.user : u))
      toast.success('Estado del usuario actualizado.')
    } catch { toast.error('Error al actualizar usuario.') }
    finally { setActionLoading(null) }
  }

  const handleDelete = async (userId, name) => {
    if (!confirm(`¿Eliminar al usuario "${name}"? Esta acción no se puede deshacer.`)) return
    setActionLoading(userId + '-delete')
    try {
      await adminApi.deleteUser(userId)
      setUsers(prev => prev.filter(u => u._id !== userId))
      toast.success('Usuario eliminado.')
    } catch (error) { toast.error(error.response?.data?.message || 'Error al eliminar.') }
    finally { setActionLoading(null) }
  }

  const handleRoleChange = async (userId, role) => {
    setActionLoading(userId + '-role')
    try {
      const { data } = await adminApi.changeRole(userId, role)
      setUsers(prev => prev.map(u => u._id === userId ? data.data.user : u))
      toast.success('Rol actualizado.')
    } catch { toast.error('Error al cambiar rol.') }
    finally { setActionLoading(null); setSelectedUser(null) }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link to="/admin" className="btn-ghost py-1 px-2">← Admin</Link>
        <span className="text-dark-500">/</span>
        <span className="text-dark-300 text-sm">Usuarios</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-dark-300 text-sm mt-1">{total} usuarios registrados</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            className="input flex-1"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-primary">Buscar</button>
        </form>
        <div className="flex gap-2">
          {['', 'user', 'owner', 'admin'].map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${roleFilter === r ? 'bg-brand-500 text-white' : 'bg-dark-700 text-dark-300 hover:text-white'}`}>
              {r || 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600 bg-dark-700/50">
                {['Usuario', 'Email', 'Rol', 'Estado', 'Registro', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-dark-300 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-dark-400">No se encontraron usuarios.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-dark-700/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400 flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-white text-sm font-medium whitespace-nowrap">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dark-300 text-sm">{user.email}</td>
                    <td className="px-4 py-3">
                      {selectedUser === user._id ? (
                        <select
                          className="input py-1 text-xs w-28"
                          defaultValue={user.role}
                          onChange={e => handleRoleChange(user._id, e.target.value)}
                          onBlur={() => setSelectedUser(null)}
                          autoFocus
                        >
                          <option value="user">user</option>
                          <option value="owner">owner</option>
                        </select>
                      ) : (
                        <button onClick={() => user.role !== 'admin' && setSelectedUser(user._id)}>
                          <RoleBadge role={user.role} />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3"><StatusDot isActive={user.isActive} /></td>
                    <td className="px-4 py-3 text-dark-400 text-xs whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== 'admin' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggle(user._id)}
                            disabled={!!actionLoading}
                            className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${user.isActive ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' : 'bg-brand-500/10 text-brand-400 hover:bg-brand-500/20'}`}
                          >
                            {actionLoading === user._id + '-toggle' ? '...' : user.isActive ? 'Suspender' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
                            disabled={!!actionLoading}
                            className="text-xs px-3 py-1 rounded-lg font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            {actionLoading === user._id + '-delete' ? '...' : 'Eliminar'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-4 py-4 border-t border-dark-700 flex items-center justify-between">
            <span className="text-dark-400 text-sm">Página {page} de {pages}</span>
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
