import React from 'react'
import { useAuth } from '../context/AuthContext'
import PlanCard from '../components/PlanCard'

const Pricing = () => {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Planes de Suscripción
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a las necesidades de tu club
          </p>
        </div>

        {/* Planes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PlanCard plan="basic" />
          <PlanCard plan="pro" featured={true} />
          <PlanCard plan="premium" />
        </div>

        {/* Información Adicional */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Facturación y Pagos
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Facturación mensual automática</li>
                <li>• Métodos de pago: Tarjeta, Transferencia</li>
                <li>• Factura electrónica incluida</li>
                <li>• Sin costos de setup adicionales</li>
              </ul>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Soporte Técnico
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Soporte por email y chat</li>
                <li>• Documentación completa</li>
                <li>• Actualizaciones incluidas</li>
                <li>• Migración de datos asistida</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing