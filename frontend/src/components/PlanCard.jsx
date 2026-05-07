import React from 'react';
import { Link } from 'react-router-dom';

const PlanCard = ({ plan, featured = false, currentPlan = false }) => {
  const plans = {
    basic: {
      name: 'Básico',
      price: 2990,
      description: 'Perfecto para empezar',
      features: [
        '1 cancha incluida',
        'Reservas ilimitadas',
        'Panel básico de gestión',
        'Soporte por email',
        'App móvil para clientes'
      ],
      color: 'gray'
    },
    pro: {
      name: 'Profesional',
      price: 5990,
      description: 'Para clubs en crecimiento',
      features: [
        '3 canchas incluidas',
        'Todas las features Básico',
        'Dashboard avanzado',
        'Sistema de torneos',
        'Soporte prioritario',
        'Reportes de ingresos'
      ],
      color: 'green'
    },
    premium: {
      name: 'Premium',
      price: 9990,
      description: 'Para clubs establecidos',
      features: [
        'Canchas ilimitadas',
        'Todas las features Pro',
        'Branding personalizado',
        'API de integración',
        'Soporte 24/7',
        'Analytics avanzado'
      ],
      color: 'purple'
    }
  };

  const planData = plans[plan];

  return (
    <div className={`card p-6 ${
      featured ? 'ring-2 ring-primary transform scale-105' : ''
    } ${currentPlan ? 'bg-primary bg-opacity-5' : ''} transition-all duration-200`}>
      
      {/* Header */}
      <div className="text-center mb-6">
        {currentPlan && (
          <span className="inline-block bg-primary text-white text-sm px-3 py-1 rounded-full mb-2">
            Plan Actual
          </span>
        )}
        <h3 className="text-2xl font-bold text-gray-900">{planData.name}</h3>
        <p className="text-gray-600 mt-2">{planData.description}</p>
        
        {/* Precio */}
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">${planData.price}</span>
          <span className="text-gray-600">/mes</span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {planData.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Botón */}
      {currentPlan ? (
        <button
          disabled
          className="w-full bg-gray-300 text-gray-600 font-medium py-3 px-4 rounded-lg cursor-not-allowed"
        >
          Plan Actual
        </button>
      ) : (
        <Link
          to={`/checkout?plan=${plan}`}
          className="block w-full bg-primary hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors duration-200"
        >
          Elegir Plan
        </Link>
      )}
    </div>
  );
};

export default PlanCard;