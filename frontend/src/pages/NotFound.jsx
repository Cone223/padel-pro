import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-gradient mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">Página no encontrada</h1>
        <p className="text-dark-300 mb-8">La página que buscás no existe o fue movida.</p>
        <Link to="/" className="btn-primary">Volver al inicio</Link>
      </div>
    </div>
  )
}
