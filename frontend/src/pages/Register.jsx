import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', passwordConfirm: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Completá los campos obligatorios.')
    if (form.password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres.')
    if (form.password !== form.passwordConfirm) return toast.error('Las contraseñas no coinciden.')
    setLoading(true)
    const result = await register(form)
    setLoading(false)
    if (result.success) {
      toast.success('¡Cuenta creada exitosamente!')
      navigate('/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  const Field = ({ name, label, type = 'text', placeholder, required }) => (
    <div>
      <label className="label">{label} {required && <span className="text-red-400">*</span>}</label>
      <input type={type} className="input" placeholder={placeholder} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} />
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30 pointer-events-none" />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-green"><span className="text-white text-xs font-bold">P</span></div>
            <span className="font-bold text-white text-lg">Padel<span className="text-brand-400">Finder</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Crear cuenta</h1>
          <p className="text-dark-300 text-sm">Gratis, rápido y sin tarjeta de crédito</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field name="name" label="Nombre completo" placeholder="Juan Pérez" required />
            <Field name="email" label="Email" type="email" placeholder="tu@email.com" required />
            <Field name="phone" label="Teléfono" placeholder="+54 9 11 1234-5678" />
            <Field name="password" label="Contraseña" type="password" placeholder="Mínimo 6 caracteres" required />
            <Field name="passwordConfirm" label="Confirmar contraseña" type="password" placeholder="Repetí tu contraseña" required />
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando cuenta...</> : 'Crear cuenta gratis'}
            </button>
          </form>
        </div>
        <p className="text-center mt-6 text-dark-300 text-sm">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}
