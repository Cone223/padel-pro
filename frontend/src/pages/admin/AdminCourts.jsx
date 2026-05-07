import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, courtsApi } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const FACILITIES = ['vestuarios', 'duchas', 'bar', 'iluminacion', 'parking', 'wifi']
const COURT_TYPES = ['cristal', 'hormigon', 'cesped artificial']

const CourtModal = ({ court, onClose, onSave }) => {
  const toast = useToast()
  const [form, setForm] = useState({
    name: court?.name || '',
    description: court?.description || '',
    pricePerHour: court?.pricePerHour || '',
    courtType: court?.courtType || 'cristal',
    'address.street': court?.address?.street || '',
    'address.city': court?.address?.city || '',
    'operatingHours.open': court?.operatingHours?.open || '08:00',
    'operatingHours.close': court?.operatingHours?.close || '22:00',
    facilities: court?.facilities || [],
    isActive: court?.isActive ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [newImages, setNewImages] = useState([])       // File objects a subir
  const [previews, setPreviews] = useState([])          // URLs de previsualización
  const [existingImages, setExistingImages] = useState(court?.images || [])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + existingImages.length + newImages.length > 5) {
      return toast.error('Máximo 5 imágenes por cancha.')
    }
    setNewImages(prev => [...prev, ...files])
    const urls = files.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...urls])
  }

  const removeNewImage = (idx) => {
    URL.revokeObjectURL(previews[idx])
    setNewImages(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const removeExistingImage = (idx) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx))
  }

  const toggle = (fac) => {
    setForm(f => ({
      ...f,
      facilities: f.facilities.includes(fac) ? f.facilities.filter(x => x !== fac) : [...f.facilities, fac]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.pricePerHour || !form.courtType) return toast.error('Completá los campos obligatorios.')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(item => fd.append(k, item))
        else fd.append(k, v)
      })
      // Imágenes nuevas
      newImages.forEach(file => fd.append('images', file))
      // Imágenes existentes que se conservan
      existingImages.forEach(url => fd.append('existingImages', url))

      if (court) await courtsApi.update(court._id, fd)
      else await courtsApi.create(fd)
      toast.success(court ? 'Cancha actualizada.' : 'Cancha creada exitosamente.')
      onSave()
    } catch (error) { toast.error(error.response?.data?.message || 'Error al guardar.') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-dark-700 sticky top-0 bg-dark-800 z-10">
          <h2 className="text-white font-bold text-xl">{court ? 'Editar cancha' : 'Nueva cancha'}</h2>
          <button onClick={onClose} className="text-dark-400 hover:text-white text-2xl leading-none transition-colors">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nombre <span className="text-red-400">*</span></label>
              <input className="input" placeholder="Cancha Central" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Precio por hora <span className="text-red-400">*</span></label>
              <input className="input" type="number" placeholder="1500" value={form.pricePerHour} onChange={e => setForm(f => ({ ...f, pricePerHour: e.target.value }))} />
            </div>
            <div>
              <label className="label">Tipo de cancha <span className="text-red-400">*</span></label>
              <select className="input" value={form.courtType} onChange={e => setForm(f => ({ ...f, courtType: e.target.value }))}>
                {COURT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Calle / Dirección</label>
              <input className="input" placeholder="Av. Libertador 1234" value={form['address.street']} onChange={e => setForm(f => ({ ...f, 'address.street': e.target.value }))} />
            </div>
            <div>
              <label className="label">Ciudad</label>
              <input className="input" placeholder="Buenos Aires" value={form['address.city']} onChange={e => setForm(f => ({ ...f, 'address.city': e.target.value }))} />
            </div>
            <div>
              <label className="label">Horario apertura</label>
              <input className="input" type="time" value={form['operatingHours.open']} onChange={e => setForm(f => ({ ...f, 'operatingHours.open': e.target.value }))} />
            </div>
            <div>
              <label className="label">Horario cierre</label>
              <input className="input" type="time" value={form['operatingHours.close']} onChange={e => setForm(f => ({ ...f, 'operatingHours.close': e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="label">Descripción</label>
              <textarea className="input h-24 resize-none" placeholder="Describe la cancha..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>

          {/* ── IMÁGENES ── */}
          <div>
            <label className="label">
              Imágenes de la cancha
              <span className="text-dark-400 font-normal ml-2">({existingImages.length + newImages.length}/5)</span>
            </label>

            {/* Previsualización de imágenes existentes */}
            {(existingImages.length > 0 || previews.length > 0) && (
              <div className="flex flex-wrap gap-3 mb-3 mt-2">
                {existingImages.map((url, i) => (
                  <div key={`ex-${i}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-dark-500 group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 text-xl transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {previews.map((url, i) => (
                  <div key={`new-${i}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-brand-500/40 group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-brand-500 rounded-full w-4 h-4 flex items-center justify-center">
                      <span className="text-white text-[9px] font-bold">NEW</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 text-xl transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Botón de carga */}
            {existingImages.length + newImages.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-dark-500 hover:border-brand-500/60 rounded-xl cursor-pointer bg-dark-700/40 hover:bg-brand-500/5 transition-all group">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl text-dark-500 group-hover:text-brand-500 transition-colors">📷</span>
                  <p className="text-sm text-dark-400 group-hover:text-dark-200 transition-colors">
                    Hacé clic para subir fotos
                  </p>
                  <p className="text-xs text-dark-500">PNG, JPG o WEBP · Máx. 5MB cada una</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <div>
            <label className="label">Instalaciones</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {FACILITIES.map(fac => (
                <button key={fac} type="button" onClick={() => toggle(fac)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize border ${form.facilities.includes(fac) ? 'bg-brand-500/20 border-brand-500/40 text-brand-400' : 'bg-dark-700 border-dark-600 text-dark-300 hover:text-white'}`}>
                  {fac}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`relative w-10 h-6 rounded-full transition-colors ${form.isActive ? 'bg-brand-500' : 'bg-dark-600'}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-4' : ''}`} />
            </button>
            <span className="text-sm text-dark-300">Cancha activa (visible para reservas)</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</> : court ? 'Actualizar cancha' : 'Crear cancha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCourts() {
  const toast = useToast()
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'new' | court object

  useEffect(() => { fetchCourts() }, [])

  const fetchCourts = async () => {
    try {
      setLoading(true)
      const { data } = await adminApi.getAllCourts()
      setCourts(data.data.courts)
    } catch { toast.error('Error al cargar canchas.') }
    finally { setLoading(false) }
  }

  const handleToggle = async (id) => {
    try {
      const { data } = await adminApi.toggleCourt(id)
      setCourts(prev => prev.map(c => c._id === id ? data.data.court : c))
      toast.success('Estado actualizado.')
    } catch { toast.error('Error al actualizar.') }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar la cancha "${name}"?`)) return
    try {
      await adminApi.deleteCourt(id)
      setCourts(prev => prev.filter(c => c._id !== id))
      toast.success('Cancha eliminada.')
    } catch (error) { toast.error(error.response?.data?.message || 'Error al eliminar.') }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/admin" className="btn-ghost py-1 px-2">← Admin</Link>
        <span className="text-dark-500">/</span>
        <span className="text-dark-300 text-sm">Canchas</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Canchas</h1>
          <p className="text-dark-300 text-sm mt-1">{courts.length} canchas en el sistema</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary">+ Nueva cancha</button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />)}
        </div>
      ) : courts.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🎾</div>
          <h3 className="text-white font-semibold mb-2">No hay canchas</h3>
          <button onClick={() => setModal('new')} className="btn-primary mt-4">Crear primera cancha</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courts.map(court => (
            <div key={court._id} className="card overflow-hidden flex flex-col">
              <div className="aspect-video bg-dark-700 relative">
                {court.images?.[0]
                  ? <img src={court.images[0]} alt={court.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl text-dark-600">🎾</div>
                }
                <div className="absolute top-2 right-2">
                  <span className={court.isActive ? 'badge-green' : 'badge-red'}>{court.isActive ? 'Activa' : 'Inactiva'}</span>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <h3 className="text-white font-semibold">{court.name}</h3>
                  <p className="text-dark-400 text-sm">{court.address?.city} · ${court.pricePerHour}/h</p>
                  {court.owner && <p className="text-dark-500 text-xs mt-1">Dueño: {court.owner.name}</p>}
                </div>
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => setModal(court)} className="btn-secondary flex-1 justify-center py-1.5 text-xs">Editar</button>
                  <button onClick={() => handleToggle(court._id)} className="btn-secondary flex-1 justify-center py-1.5 text-xs">
                    {court.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => handleDelete(court._id, court.name)} className="btn-danger justify-center py-1.5 px-3 text-xs">🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <CourtModal
          court={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchCourts() }}
        />
      )}
    </div>
  )
}
