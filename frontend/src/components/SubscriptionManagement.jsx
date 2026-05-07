import React, { useState, useEffect } from 'react';
import { subscriptionsApi } from '../api/subscriptionsApi';
import PlanCard from './PlanCard';

const SubscriptionManagement = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await subscriptionsApi.getMySubscription();
      setSubscription(response.data.data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setMessage('Error al cargar la suscripción');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (newPlan) => {
    setActionLoading(true);
    try {
      const response = await subscriptionsApi.upgrade(newPlan);
      setSubscription(response.data.data.subscription);
      setMessage('Plan actualizado exitosamente!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al actualizar el plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar tu suscripción? Podrás reactivarla después.')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await subscriptionsApi.cancel();
      setSubscription(response.data.data.subscription);
      setMessage('Suscripción cancelada. Terminará al final del período actual.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al cancelar la suscripción');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    try {
      const response = await subscriptionsApi.reactivate();
      setSubscription(response.data.data.subscription);
      setMessage('Suscripción reactivada exitosamente!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al reactivar la suscripción');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-8 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Suscripción</h2>
        <p className="text-gray-600">
          Administra tu plan y características de PadelFinder Pro
        </p>
      </div>

      {/* Mensajes */}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {message}
        </div>
      )}

      {/* Estado actual */}
      {subscription && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Estado Actual</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900">Plan Actual</h4>
              <p className="text-2xl font-bold text-primary capitalize">{subscription.plan}</p>
              <p className="text-gray-600">${subscription.price}/mes</p>
              
              <div className="mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : subscription.status === 'canceled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {subscription.status === 'active' && 'Activa'}
                  {subscription.status === 'canceled' && 'Cancelada'}
                  {subscription.status === 'incomplete' && 'Incompleta'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Características</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {subscription.features.maxCourts === 999 ? 'Canchas ilimitadas' : `${subscription.features.maxCourts} canchas`}
                </li>
                {subscription.features.tournamentModule && (
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Módulo de torneos
                  </li>
                )}
                {subscription.features.advancedAnalytics && (
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Analytics avanzado
                  </li>
                )}
                {subscription.features.prioritySupport && (
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Soporte prioritario
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-6 flex gap-4">
            {subscription.status === 'active' && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {actionLoading ? 'Procesando...' : 'Cancelar Suscripción'}
              </button>
            )}
            
            {subscription.status === 'canceled' && (
              <button
                onClick={handleReactivate}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {actionLoading ? 'Procesando...' : 'Reactivar Suscripción'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Planes disponibles */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-6">Planes Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PlanCard 
            plan="basic" 
            currentPlan={subscription?.plan === 'basic'}
          />
          <PlanCard 
            plan="pro" 
            featured={true}
            currentPlan={subscription?.plan === 'pro'}
          />
          <PlanCard 
            plan="premium" 
            currentPlan={subscription?.plan === 'premium'}
          />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;